package cl.veterinaria.historial_service.repository;

import cl.veterinaria.historial_service.entity.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HistorialRepository
        extends JpaRepository<HistorialClinico, Long> {

    List<HistorialClinico>
    findByMascotaIdOrderByFechaAtencionDesc(Long mascotaId);

    List<HistorialClinico>
    findByVeterinarioIdOrderByFechaAtencionDesc(Long veterinarioId);

    Optional<HistorialClinico> findByCitaId(Long citaId);

    boolean existsByCitaId(Long citaId);
}
