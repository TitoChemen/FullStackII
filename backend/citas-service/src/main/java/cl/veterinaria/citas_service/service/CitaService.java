
package cl.veterinaria.citas_service.service;

import cl.veterinaria.citas_service.client.MascotaClient;
import cl.veterinaria.citas_service.client.UsuarioClient;
import cl.veterinaria.citas_service.dto.request.CitaRequest;
import cl.veterinaria.citas_service.dto.response.CitaResponse;
import cl.veterinaria.citas_service.entity.Cita;
import cl.veterinaria.citas_service.enums.EstadoCita;
import cl.veterinaria.citas_service.repository.CitaRepository;
import cl.veterinaria.citas_service.dto.request.CambiarEstadoCitaRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import cl.veterinaria.citas_service.dto.request.AsignarVeterinarioRequest;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final MascotaClient mascotaClient;
    private final UsuarioClient usuarioClient;

    @Transactional
    public CitaResponse registrar(CitaRequest request, Jwt jwt) {

        // Solo propietarios y personal autorizado pueden crear citas
        if (!esPersonalAutorizado(jwt) &&
                !tieneRol(jwt, "DUENO_MASCOTA")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para registrar citas"
            );
        }

        LocalDateTime inicio = request.fechaHoraInicio();
        LocalDateTime fin = request.fechaHoraFin();

        if (inicio == null || fin == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Las fechas de inicio y término son obligatorias"
            );
        }

        if (!inicio.isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La cita debe comenzar en una fecha futura"
            );
        }

        if (!fin.isAfter(inicio)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha de término debe ser posterior al inicio"
            );
        }

        if (request.mascotaId() == null ||
                request.mascotaId() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID de la mascota no es válido"
            );
        }

        // Consultar Mascotas Service mediante Eureka
        MascotaClient.MascotaInfo mascota =
                mascotaClient.obtenerMascota(
                        request.mascotaId(),
                        jwt.getTokenValue()
                );

        // Los propietarios solo pueden reservar para sus mascotas
        if (!esPersonalAutorizado(jwt)) {
            comprobarPropietario(mascota, jwt);
        }

        // Validar al veterinario si se asignó uno
        if (request.veterinarioId() != null) {
            usuarioClient.validarVeterinario(
                    request.veterinarioId(),
                    jwt.getTokenValue()
            );
        }

        // Comprobar conflictos de horario de la mascota
        boolean mascotaOcupada = citaRepository
                .findByMascotaIdOrderByFechaHoraInicioDesc(
                        request.mascotaId()
                )
                .stream()
                .anyMatch(cita -> seSuperpone(cita, inicio, fin));

        if (mascotaOcupada) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La mascota ya tiene una cita en ese horario"
            );
        }

        // Comprobar conflictos de horario del veterinario
        if (request.veterinarioId() != null) {

            boolean veterinarioOcupado = citaRepository
                    .findByVeterinarioIdOrderByFechaHoraInicioAsc(
                            request.veterinarioId()
                    )
                    .stream()
                    .anyMatch(cita -> seSuperpone(cita, inicio, fin));

            if (veterinarioOcupado) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El veterinario ya tiene una cita en ese horario"
                );
            }
        }

        Cita cita = new Cita();

        cita.setMascotaId(request.mascotaId());
        cita.setVeterinarioId(request.veterinarioId());
        cita.setFechaHoraInicio(inicio);
        cita.setFechaHoraFin(fin);
        cita.setMotivo(request.motivo());
        cita.setObservaciones(request.observaciones());
        cita.setEstado(EstadoCita.PENDIENTE);

        Cita guardada = citaRepository.save(cita);

        return convertirRespuesta(guardada);
    }

    @Transactional(readOnly = true)
    public CitaResponse obtenerPorId(Long id, Jwt jwt) {

        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No existe una cita con ID: " + id
                ));

        if (!esPersonalAutorizado(jwt)) {

            boolean esVeterinarioAsignado =
                    tieneRol(jwt, "VETERINARIO") &&
                            cita.getVeterinarioId() != null &&
                            cita.getVeterinarioId()
                                    .toString()
                                    .equals(jwt.getSubject());

            if (!esVeterinarioAsignado) {
                validarAccesoPropietario(
                        cita.getMascotaId(),
                        jwt
                );
            }
        }

        return convertirRespuesta(cita);
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> listarPorMascota(
            Long mascotaId,
            Jwt jwt
    ) {

        if (!esPersonalAutorizado(jwt)) {
            validarAccesoPropietario(mascotaId, jwt);
        }

        return citaRepository
                .findByMascotaIdOrderByFechaHoraInicioDesc(mascotaId)
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CitaResponse> listarPorVeterinario(
            Long veterinarioId,
            Jwt jwt
    ) {

        boolean esElMismoVeterinario =
                tieneRol(jwt, "VETERINARIO") &&
                        veterinarioId != null &&
                        veterinarioId.toString().equals(jwt.getSubject());

        if (!esPersonalAutorizado(jwt) &&
                !esElMismoVeterinario) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes consultar las citas de otro veterinario"
            );
        }

        return citaRepository
                .findByVeterinarioIdOrderByFechaHoraInicioAsc(
                        veterinarioId
                )
                .stream()
                .map(this::convertirRespuesta)
                .toList();
    }

    // Comprueba que un propietario tenga acceso a la mascota
    private void validarAccesoPropietario(
            Long mascotaId,
            Jwt jwt
    ) {

        if (!tieneRol(jwt, "DUENO_MASCOTA")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para consultar estas citas"
            );
        }

        MascotaClient.MascotaInfo mascota =
                mascotaClient.obtenerMascota(
                        mascotaId,
                        jwt.getTokenValue()
                );

        comprobarPropietario(mascota, jwt);
    }

    private void comprobarPropietario(
            MascotaClient.MascotaInfo mascota,
            Jwt jwt
    ) {

        if (mascota.duenoId() == null ||
                !mascota.duenoId()
                        .toString()
                        .equals(jwt.getSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta mascota no pertenece al usuario autenticado"
            );
        }
    }

    private boolean esPersonalAutorizado(Jwt jwt) {
        return tieneRol(jwt, "ADMINISTRADOR") ||
                tieneRol(jwt, "RECEPCIONISTA");
    }

    private boolean tieneRol(Jwt jwt, String rol) {

        List<String> roles = jwt.getClaimAsStringList("roles");

        return roles != null && roles.contains(rol);
    }

    private boolean seSuperpone(
            Cita cita,
            LocalDateTime inicio,
            LocalDateTime fin
    ) {

        if (cita.getEstado() == EstadoCita.CANCELADA ||
                cita.getEstado() == EstadoCita.COMPLETADA ||
                cita.getEstado() == EstadoCita.NO_ASISTIO) {
            return false;
        }

        return inicio.isBefore(cita.getFechaHoraFin()) &&
                fin.isAfter(cita.getFechaHoraInicio());
    }

    private CitaResponse convertirRespuesta(Cita cita) {

        return new CitaResponse(
                cita.getId(),
                cita.getMascotaId(),
                cita.getVeterinarioId(),
                cita.getFechaHoraInicio(),
                cita.getFechaHoraFin(),
                cita.getMotivo(),
                cita.getEstado(),
                cita.getObservaciones(),
                cita.getFechaCreacion()
        );
    }


    @Transactional
    public CitaResponse cambiarEstado(
            Long id,
            CambiarEstadoCitaRequest request,
            Jwt jwt
    ) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La cita no existe"
                ));

        EstadoCita nuevoEstado = request.estado();

        if (nuevoEstado == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nuevo estado es obligatorio"
            );
        }

        List<String> roles = jwt.getClaimAsStringList("roles");

        boolean personal = roles != null &&
                (roles.contains("ADMINISTRADOR")
                        || roles.contains("RECEPCIONISTA"));

        boolean veterinarioAsignado = roles != null
                && roles.contains("VETERINARIO")
                && cita.getVeterinarioId() != null
                && cita.getVeterinarioId().toString()
                .equals(jwt.getSubject());

        // Primero verificamos los permisos.
        if (nuevoEstado == EstadoCita.CANCELADA) {

            if (!personal) {
                if (roles == null || !roles.contains("DUENO_MASCOTA")) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "No tienes permisos para cancelar esta cita"
                    );
                }

                var mascota = mascotaClient.obtenerMascota(
                        cita.getMascotaId(),
                        jwt.getTokenValue()
                );

                if (!mascota.duenoId().toString().equals(jwt.getSubject())) {
                    throw new ResponseStatusException(
                            HttpStatus.FORBIDDEN,
                            "La cita no pertenece a tu mascota"
                    );
                }
            }

        } else if (nuevoEstado == EstadoCita.EN_CURSO
                || nuevoEstado == EstadoCita.COMPLETADA) {

            if (!personal && !veterinarioAsignado) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No tienes permisos para atender esta cita"
                );
            }

        } else if (!personal) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para cambiar este estado"
            );
        }

        // Después comprobamos si la transición es válida.
        EstadoCita estadoActual = cita.getEstado();

        boolean transicionValida = switch (estadoActual) {
            case PENDIENTE ->
                    nuevoEstado == EstadoCita.CONFIRMADA
                            || nuevoEstado == EstadoCita.CANCELADA;

            case CONFIRMADA ->
                    nuevoEstado == EstadoCita.EN_CURSO
                            || nuevoEstado == EstadoCita.CANCELADA
                            || nuevoEstado == EstadoCita.NO_ASISTIO;

            case EN_CURSO ->
                    nuevoEstado == EstadoCita.COMPLETADA;

            case COMPLETADA, CANCELADA, NO_ASISTIO -> false;
        };

        if (!transicionValida) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se permite cambiar de "
                            + estadoActual + " a " + nuevoEstado
            );
        }

        cita.setEstado(nuevoEstado);

        return convertirRespuesta(citaRepository.save(cita));
    }

    @Transactional
    public CitaResponse asignarVeterinario(
            Long id,
            AsignarVeterinarioRequest request,
            Jwt jwt
    ) {
        // 1. Solo administración y recepción pueden asignar.
        List<String> roles = jwt.getClaimAsStringList("roles");

        boolean personalAutorizado = roles != null
                && (roles.contains("ADMINISTRADOR")
                || roles.contains("RECEPCIONISTA"));

        if (!personalAutorizado) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para asignar veterinarios"
            );
        }

        // 2. Comprobar que la cita exista.
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La cita no existe"
                ));

        // 3. Solo se pueden asignar citas pendientes o confirmadas.
        if (cita.getEstado() != EstadoCita.PENDIENTE
                && cita.getEstado() != EstadoCita.CONFIRMADA) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede asignar un veterinario en este estado"
            );
        }

        Long veterinarioId = request.veterinarioId();

        // 4. Validar el veterinario mediante usuarios-service.
        usuarioClient.validarVeterinario(
                veterinarioId,
                jwt.getTokenValue()
        );

        // 5. Comprobar que no tenga otra cita en ese horario.
        List<Cita> citasVeterinario =
                citaRepository.findByVeterinarioIdOrderByFechaHoraInicioAsc(
                        veterinarioId
                );

        for (Cita otra : citasVeterinario) {

            // No comparar la cita consigo misma.
            if (otra.getId().equals(cita.getId())) {
                continue;
            }

            // Los estados finales no bloquean horarios.
            if (otra.getEstado() == EstadoCita.CANCELADA
                    || otra.getEstado() == EstadoCita.COMPLETADA
                    || otra.getEstado() == EstadoCita.NO_ASISTIO) {
                continue;
            }

            boolean superposicion =
                    cita.getFechaHoraInicio()
                            .isBefore(otra.getFechaHoraFin())
                            && cita.getFechaHoraFin()
                            .isAfter(otra.getFechaHoraInicio());

            if (superposicion) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El veterinario ya tiene una cita en ese horario"
                );
            }
        }

        // 6. Asignar y guardar.
        cita.setVeterinarioId(veterinarioId);

        return convertirRespuesta(citaRepository.save(cita));
    }

}
