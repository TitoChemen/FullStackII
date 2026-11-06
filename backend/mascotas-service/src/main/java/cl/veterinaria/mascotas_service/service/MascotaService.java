
package cl.veterinaria.mascotas_service.service;

import cl.veterinaria.mascotas_service.client.UsuarioClient;
import cl.veterinaria.mascotas_service.dto.request.MascotaRequest;
import cl.veterinaria.mascotas_service.dto.response.MascotaResponse;
import cl.veterinaria.mascotas_service.entity.Mascota;
import cl.veterinaria.mascotas_service.repository.MascotaRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MascotaService {

    private final MascotaRepository mascotaRepository;

    // NUEVO: cliente HTTP para consultar usuarios-service
    private final UsuarioClient usuarioClient;

    // Registrar una nueva mascota
    @Transactional
    public MascotaResponse registrar(MascotaRequest request) {

        if (!esPersonalEditor()) {
            if (!tieneRol("DUENO_MASCOTA")
                    || !Objects.equals(
                            request.duenoId(),
                            usuarioActualId()
                    )) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No puedes registrar mascotas para otro propietario"
                );
            }
        }

        // NUEVO: comprobar que el propietario realmente existe,
        // está activo y tiene el rol DUENO_MASCOTA.
        usuarioClient.validarPropietario(
                request.duenoId(),
                autenticacion()
        );

        Mascota mascota = new Mascota();
        copiarDatos(mascota, request);
        mascota.setActivo(true);

        return MascotaResponse.fromEntity(
                mascotaRepository.save(mascota)
        );
    }

    // Listar mascotas activas (personal autorizado)
    public List<MascotaResponse> listar() {

        if (!esPersonal()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para listar todas las mascotas"
            );
        }

        return mascotaRepository.findByActivoTrue()
                .stream()
                .map(MascotaResponse::fromEntity)
                .toList();
    }

    // Listar mascotas del usuario autenticado
    public List<MascotaResponse> listarMisMascotas() {

        return mascotaRepository
                .findByDuenoIdAndActivoTrue(usuarioActualId())
                .stream()
                .map(MascotaResponse::fromEntity)
                .toList();
    }

    // Obtener una mascota por su ID
    public MascotaResponse obtenerPorId(Long id) {

        Mascota mascota = buscarActiva(id);
        validarLectura(mascota);

        return MascotaResponse.fromEntity(mascota);
    }

    // Actualizar los datos de una mascota
    @Transactional
    public MascotaResponse actualizar(
            Long id,
            MascotaRequest request
    ) {

        Mascota mascota = buscarActiva(id);
        validarEdicion(mascota);

        boolean cambiaPropietario = !Objects.equals(
                request.duenoId(),
                mascota.getDuenoId()
        );

        // Un propietario no puede transferir su mascota
        // a otro usuario mediante este endpoint.
        if (!esPersonalEditor() && cambiaPropietario) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes cambiar el propietario de la mascota"
            );
        }

        // NUEVO: si el personal cambia el propietario,
        // comprobar que el nuevo usuario sea válido.
        if (cambiaPropietario) {
            usuarioClient.validarPropietario(
                    request.duenoId(),
                    autenticacion()
            );
        }

        copiarDatos(mascota, request);

        return MascotaResponse.fromEntity(
                mascotaRepository.save(mascota)
        );
    }

    // Desactivar una mascota sin eliminarla de MySQL
    @Transactional
    public void desactivar(Long id) {

        Mascota mascota = buscarActiva(id);
        validarEdicion(mascota);

        mascota.setActivo(false);
        mascotaRepository.save(mascota);
    }

    // Buscar una mascota activa
    private Mascota buscarActiva(Long id) {

        return mascotaRepository.findById(id)
                .filter(Mascota::isActivo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mascota no encontrada"
                ));
    }

    // Copiar los datos del DTO a la entidad
    private void copiarDatos(
            Mascota mascota,
            MascotaRequest request
    ) {

        mascota.setNombre(request.nombre());
        mascota.setEspecie(request.especie());
        mascota.setRaza(request.raza());
        mascota.setSexo(request.sexo());
        mascota.setFechaNacimiento(request.fechaNacimiento());
        mascota.setDuenoId(request.duenoId());
    }

    // Comprobar permisos de lectura
    private void validarLectura(Mascota mascota) {

        if (esPersonal()) {
            return;
        }

        if (tieneRol("DUENO_MASCOTA")
                && mascota.getDuenoId().equals(usuarioActualId())) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar esta mascota"
        );
    }

    // Comprobar permisos de modificación
    private void validarEdicion(Mascota mascota) {

        if (esPersonalEditor()) {
            return;
        }

        if (tieneRol("DUENO_MASCOTA")
                && mascota.getDuenoId().equals(usuarioActualId())) {
            return;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para modificar esta mascota"
        );
    }

    // Roles que pueden consultar todas las mascotas
    private boolean esPersonal() {

        return tieneRol("ADMINISTRADOR")
                || tieneRol("RECEPCIONISTA")
                || tieneRol("VETERINARIO");
    }

    // Roles que pueden registrar y modificar mascotas
    private boolean esPersonalEditor() {

        return tieneRol("ADMINISTRADOR")
                || tieneRol("RECEPCIONISTA");
    }

    // Obtener el ID del usuario desde el JWT validado
    private Long usuarioActualId() {

        return Long.parseLong(
                autenticacion().getToken().getSubject()
        );
    }

    // Comprobar un rol incluido en el JWT
    private boolean tieneRol(String rol) {

        List<String> roles = autenticacion()
                .getToken()
                .getClaimAsStringList("roles");

        return roles != null && roles.contains(rol);
    }

    // Obtener la autenticación actual
    private JwtAuthenticationToken autenticacion() {

        var auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión"
            );
        }

        return jwtAuth;
    }
}
