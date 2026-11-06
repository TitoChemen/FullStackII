package cl.veterinaria.usuarios_service.dto.response;

import cl.veterinaria.usuarios_service.entity.Usuario;
import cl.veterinaria.usuarios_service.enums.Rol;

import java.time.LocalDateTime;

public record UsuarioResponse(

        Long id,
        String nombre,
        String apellido,
        String correo,
        Rol rol,
        boolean activo,
        LocalDateTime fechaCreacion

) {

    public static UsuarioResponse fromEntity(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getRol(),
                usuario.isActivo(),
                usuario.getFechaCreacion()
        );
    }
}
