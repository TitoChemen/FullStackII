package cl.veterinaria.citas_service.dto.request;

import cl.veterinaria.citas_service.enums.EstadoCita;
import jakarta.validation.constraints.NotNull;

public record CambiarEstadoCitaRequest(

        @NotNull(message = "El estado de la cita es obligatorio")
        EstadoCita estado

) {
}
