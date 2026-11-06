
package cl.veterinaria.usuarios_service.dto.response;

public record AuthResponse(

        String accessToken,
        String tokenType,
        long expiresIn,
        UsuarioResponse usuario

) {}
