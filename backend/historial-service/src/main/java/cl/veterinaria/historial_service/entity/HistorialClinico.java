package cl.veterinaria.historial_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historiales_clinicos")
@Getter
@Setter
@NoArgsConstructor
public class HistorialClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mascota_id", nullable = false)
    private Long mascotaId;

    @Column(name = "cita_id", unique = true)
    private Long citaId;

    @Column(name = "veterinario_id", nullable = false)
    private Long veterinarioId;

    @Column(name = "fecha_atencion", nullable = false)
    private LocalDateTime fechaAtencion;

    @Column(name = "motivo_consulta", nullable = false, length = 500)
    private String motivoConsulta;

    @Column(columnDefinition = "TEXT")
    private String diagnostico;

    @Column(columnDefinition = "TEXT")
    private String tratamiento;

    @Column(columnDefinition = "TEXT")
    private String indicaciones;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    public void prePersist() {
        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }
}
