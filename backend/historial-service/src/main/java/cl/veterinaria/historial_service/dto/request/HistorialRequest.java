package cl.veterinaria.historial_service.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record HistorialRequest(

    @NotNull(message = "La mascota es obligatoria")
    @Positive(message = "El ID de la mascota debe ser positivo")
    Long mascotaId,

    @Positive(message = "El ID de la cita debe ser positivo")
    Long citaId,

    @NotNull(message = "El veterinario es obligatorio")
    @Positive(message = "El ID del veterinario debe ser positivo")
    Long veterinarioId,

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
