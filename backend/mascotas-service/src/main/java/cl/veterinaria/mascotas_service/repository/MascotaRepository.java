
package cl.veterinaria.mascotas_service.repository;

import cl.veterinaria.mascotas_service.entity.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {

    // Buscar todas las mascotas de un dueño
    List<Mascota> findByDuenoId(Long duenoId);

    // Buscar mascotas activas de un dueño
    List<Mascota> findByDuenoIdAndActivoTrue(Long duenoId);

    // Buscar todas las mascotas activas
    List<Mascota> findByActivoTrue();

    // Comprobar si una mascota pertenece a un dueño
    boolean existsByIdAndDuenoId(Long id, Long duenoId);
}
