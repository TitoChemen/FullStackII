package cl.veterinaria.usuarios_service.dto.request;

import cl.veterinaria.usuarios_service.enums.Rol;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioUpdateRequest(

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100)
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 100)
        String apellido,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        @NotNull(message = "El estado es obligatorio")
        Boolean activo

) {}