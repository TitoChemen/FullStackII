package cl.veterinaria.historial_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record HistorialUpdateRequest(

        @NotNull(message = "La fecha de atención es obligatoria")
        LocalDateTime fechaAtencion,

        @NotBlank(message = "El motivo de consulta es obligatorio")
        @Size(max = 500)
        String motivoConsulta,

        String diagnostico,
        String tratamiento,
        String indicaciones,
        String observaciones

) {}