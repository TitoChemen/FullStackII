package cl.veterinaria.historial_service.dto.response;

import java.time.LocalDateTime;

public record HistorialResponse(

    Long id,
    Long mascotaId,
    Long citaId,
    Long veterinarioId,
    LocalDateTime fechaAtencion,
    String motivoConsulta,
    String diagnostico,
    String tratamiento,
    String indicaciones,
    String observaciones,
    LocalDateTime fechaCreacion

) {}
