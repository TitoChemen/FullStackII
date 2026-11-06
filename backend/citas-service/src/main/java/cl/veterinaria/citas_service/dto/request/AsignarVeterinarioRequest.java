
package cl.veterinaria.citas_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AsignarVeterinarioRequest(

        @NotNull(message = "El veterinario es obligatorio")
        @Positive(message = "El ID del veterinario debe ser positivo")
        Long veterinarioId

) {
}
