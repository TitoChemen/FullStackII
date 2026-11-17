package cl.veterinaria.citas_service.dto.request;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record CitaUpdateRequest(

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

) {}