package cl.veterinaria.historial_service.service;

import cl.veterinaria.historial_service.client.CitaClient;
import cl.veterinaria.historial_service.client.MascotaClient;
import cl.veterinaria.historial_service.client.UsuarioClient;
import cl.veterinaria.historial_service.dto.request.HistorialRequest;
import cl.veterinaria.historial_service.dto.response.HistorialResponse;
import cl.veterinaria.historial_service.entity.HistorialClinico;
import cl.veterinaria.historial_service.repository.HistorialRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class HistorialService {

    private final HistorialRepository repository;
    private final MascotaClient mascotaClient;
    private final UsuarioClient usuarioClient;
    private final CitaClient citaClient;

    public HistorialService(
            HistorialRepository repository,
            MascotaClient mascotaClient,
            UsuarioClient usuarioClient,
            CitaClient citaClient
    ) {
        this.repository = repository;
        this.mascotaClient = mascotaClient;
        this.usuarioClient = usuarioClient;
        this.citaClient = citaClient;
    }

    @Transactional
    public HistorialResponse registrar(
            HistorialRequest request,
            Jwt jwt
    ) {
        validarAccesoVeterinario(jwt, request.veterinarioId());

        mascotaClient.obtenerMascota(
                request.mascotaId(), jwt.getTokenValue()
        );
        usuarioClient.validarVeterinario(request.veterinarioId(), jwt.getTokenValue());

        if (request.citaId() != null) {

            if (repository.existsByCitaId(request.citaId())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La cita ya tiene un historial clínico"
                );
            }

            CitaClient.CitaInfo cita =
                    citaClient.obtenerCita(request.citaId(), jwt.getTokenValue());

            if (!request.mascotaId().equals(cita.mascotaId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cita no pertenece a la mascota indicada"
                );
            }

            if (!request.veterinarioId().equals(cita.veterinarioId())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La cita no corresponde al veterinario indicado"
                );
            }

            if (!"COMPLETADA".equals(cita.estado())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Solo se puede registrar un historial asociado a una cita completada"
                );
            }
        }

        HistorialClinico historial = new HistorialClinico();

        historial.setMascotaId(request.mascotaId());
        historial.setCitaId(request.citaId());
        historial.setVeterinarioId(request.veterinarioId());
        historial.setFechaAtencion(request.fechaAtencion());
        historial.setMotivoConsulta(request.motivoConsulta());
        historial.setDiagnostico(request.diagnostico());
        historial.setTratamiento(request.tratamiento());
        historial.setIndicaciones(request.indicaciones());
        historial.setObservaciones(request.observaciones());

        try {
            return convertir(repository.saveAndFlush(historial));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se pudo registrar el historial: existe un conflicto de datos",
                    ex
            );
        }
    }

    @Transactional(readOnly = true)
    public HistorialResponse obtenerPorId(Long id, Jwt jwt) {

        HistorialClinico historial = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el historial clínico"
                ));

        validarAccesoVeterinario(jwt, historial.getVeterinarioId());
        return convertir(historial);
    }

    @Transactional(readOnly = true)
    public List<HistorialResponse> obtenerPorMascota(
            Long mascotaId,
            Jwt jwt
    ) {
        mascotaClient.obtenerMascota(
                mascotaId, jwt.getTokenValue()
        );

        return repository
                .findByMascotaIdOrderByFechaAtencionDesc(mascotaId)
                .stream()
                .filter(historial -> puedeAcceder(
                        jwt, historial.getVeterinarioId()
                ))
                .map(this::convertir)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HistorialResponse> obtenerPorVeterinario(
            Long veterinarioId,
            Jwt jwt
    ) {
        validarAccesoVeterinario(jwt, veterinarioId);

        usuarioClient.validarVeterinario(
                veterinarioId, jwt.getTokenValue()
        );

        return repository
                .findByVeterinarioIdOrderByFechaAtencionDesc(veterinarioId)
                .stream()
                .map(this::convertir)
                .toList();
    }

    @Transactional(readOnly = true)
    public HistorialResponse obtenerPorCita(Long citaId, Jwt jwt) {

        HistorialClinico historial = repository.findByCitaId(citaId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe historial para la cita indicada"
                ));

        validarAccesoVeterinario(jwt, historial.getVeterinarioId());
        return convertir(historial);
    }

    private void validarAccesoVeterinario(
            Jwt jwt,
            Long veterinarioId
    ) {
        if (jwt.getClaimAsStringList("roles") != null
                && jwt.getClaimAsStringList("roles")
                        .contains("ADMINISTRADOR")) {
            return;
        }

        boolean esVeterinario =
                jwt.getClaimAsStringList("roles") != null
                && jwt.getClaimAsStringList("roles")
                        .contains("VETERINARIO");

        if (!esVeterinario) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para esta operación"
            );
        }

        if (!String.valueOf(veterinarioId)
                .equals(jwt.getSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes operar sobre historiales de otro veterinario"
            );
        }
    }

    private boolean puedeAcceder(Jwt jwt, Long veterinarioId) {

        if (jwt.getClaimAsStringList("roles") == null) {
            return false;
        }

        if (jwt.getClaimAsStringList("roles")
                .contains("ADMINISTRADOR")) {
            return true;
        }

        return jwt.getClaimAsStringList("roles")
                .contains("VETERINARIO")
                && String.valueOf(veterinarioId)
                        .equals(jwt.getSubject());
    }

    private HistorialResponse convertir(HistorialClinico historial) {

        return new HistorialResponse(
                historial.getId(),
                historial.getMascotaId(),
                historial.getCitaId(),
                historial.getVeterinarioId(),
                historial.getFechaAtencion(),
                historial.getMotivoConsulta(),
                historial.getDiagnostico(),
                historial.getTratamiento(),
                historial.getIndicaciones(),
                historial.getObservaciones(),
                historial.getFechaCreacion()
        );
    }
}
