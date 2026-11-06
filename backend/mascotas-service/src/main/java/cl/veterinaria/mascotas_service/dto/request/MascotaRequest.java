
package cl.veterinaria.mascotas_service.dto.request;

import cl.veterinaria.mascotas_service.enums.SexoMascota;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record MascotaRequest(

        @NotBlank(message = "El nombre de la mascota es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
        String nombre,

        @NotBlank(message = "La especie es obligatoria")
        @Size(max = 50, message = "La especie no puede superar los 50 caracteres")
        String especie,

        @Size(max = 100, message = "La raza no puede superar los 100 caracteres")
        String raza,

        @NotNull(message = "El sexo de la mascota es obligatorio")
        SexoMascota sexo,

        @PastOrPresent(message = "La fecha de nacimiento no puede ser futura")
        LocalDate fechaNacimiento,

        @NotNull(message = "El ID del dueño es obligatorio")
        @Positive(message = "El ID del dueño debe ser mayor que cero")
        Long duenoId

) {
}
