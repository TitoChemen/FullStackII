package cl.veterinaria.citas_service.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record CitaRequest(

        @NotNull(message = "La mascota es obligatoria")
        @Positive(message = "El ID de la mascota debe ser positivo")
        Long mascotaId,

        @Positive(message = "El ID del veterinario debe ser positivo")
        Long veterinarioId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @Future(message = "La fecha de inicio debe ser futura")
        LocalDateTime fechaHoraInicio,

        @NotNull(message = "La fecha de término es obligatoria")
        @Future(message = "La fecha de término debe ser futura")
        LocalDateTime fechaHoraFin,

        @NotBlank(message = "El motivo es obligatorio")
        @Size(max = 500, message = "El motivo no puede superar 500 caracteres")
        String motivo,

        @Size(max = 1000, message = "Las observaciones no pueden superar 1000 caracteres")
        String observaciones

) {
}
