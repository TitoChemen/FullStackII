
package cl.veterinaria.mascotas_service.dto.response;

import cl.veterinaria.mascotas_service.entity.Mascota;
import cl.veterinaria.mascotas_service.enums.SexoMascota;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MascotaResponse(

        Long id,
        String nombre,
        String especie,
        String raza,
        SexoMascota sexo,
        LocalDate fechaNacimiento,
        Long duenoId,
        boolean activo,
        LocalDateTime fechaRegistro

) {

    public static MascotaResponse fromEntity(Mascota mascota) {

        return new MascotaResponse(
                mascota.getId(),
                mascota.getNombre(),
                mascota.getEspecie(),
                mascota.getRaza(),
                mascota.getSexo(),
                mascota.getFechaNacimiento(),
                mascota.getDuenoId(),
                mascota.isActivo(),
                mascota.getFechaRegistro()
        );
    }
}
