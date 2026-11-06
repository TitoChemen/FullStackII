
package cl.veterinaria.mascotas_service.entity;

import cl.veterinaria.mascotas_service.enums.SexoMascota;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "mascotas",
        indexes = {
                @Index(
                        name = "idx_mascotas_dueno_id",
                        columnList = "dueno_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String especie;

    @Column(length = 100)
    private String raza;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SexoMascota sexo;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(name = "dueno_id", nullable = false)
    private Long duenoId;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(
            name = "fecha_registro",
            nullable = false,
            updatable = false
    )
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void antesDeGuardar() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}
