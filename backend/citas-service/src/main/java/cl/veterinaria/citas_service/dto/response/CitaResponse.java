package cl.veterinaria.citas_service.dto.response;

import cl.veterinaria.citas_service.enums.EstadoCita;

import java.time.LocalDateTime;

public record CitaResponse(

        Long id,

        Long mascotaId,

        Long veterinarioId,

        LocalDateTime fechaHoraInicio,

        LocalDateTime fechaHoraFin,

        String motivo,

        EstadoCita estado,

        String observaciones,

        LocalDateTime fechaCreacion

) {
}
