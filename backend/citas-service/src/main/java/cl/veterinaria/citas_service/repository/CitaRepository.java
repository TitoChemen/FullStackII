package cl.veterinaria.citas_service.repository;

import cl.veterinaria.citas_service.entity.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // Buscar todas las citas de una mascota
    List<Cita> findByMascotaIdOrderByFechaHoraInicioDesc(
            Long mascotaId
    );

    // Buscar las citas asignadas a un veterinario
    List<Cita> findByVeterinarioIdOrderByFechaHoraInicioAsc(
            Long veterinarioId
    );

}
