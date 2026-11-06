
package cl.veterinaria.usuarios_service.service;

import cl.veterinaria.usuarios_service.dto.response.UsuarioResponse;
import cl.veterinaria.usuarios_service.entity.Usuario;
import cl.veterinaria.usuarios_service.enums.Rol;
import cl.veterinaria.usuarios_service.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<UsuarioResponse> listarUsuarios() {

        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponse::fromEntity)
                .toList();
    }

    public UsuarioResponse buscarPorId(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Usuario no encontrado"
                ));

        return UsuarioResponse.fromEntity(usuario);
    }

    public UsuarioResponse obtenerMiPerfil(Long id) {

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "La cuenta ya no existe"
                ));

        if (!usuario.isActivo()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La cuenta está desactivada"
            );
        }

        return UsuarioResponse.fromEntity(usuario);
    }

    // Comprueba si el usuario puede ser propietario de una mascota

    // Comprueba si el usuario puede ser propietario de una mascota
    public boolean esPropietarioValido(Long id) {

        return usuarioRepository.findById(id)
                .map(usuario ->
                        usuario.isActivo()
                                && usuario.getRol() == Rol.DUENO_MASCOTA
                )
                .orElse(false);
    }

    // Comprueba si el usuario es un veterinario activo
    public boolean esVeterinarioValido(Long id) {

        return usuarioRepository.findById(id)
                .map(usuario ->
                        usuario.isActivo()
                                && usuario.getRol() == Rol.VETERINARIO
                )
                .orElse(false);
    }

}

