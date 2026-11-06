
package cl.veterinaria.mascotas_service.controller;

import cl.veterinaria.mascotas_service.dto.request.MascotaRequest;
import cl.veterinaria.mascotas_service.dto.response.MascotaResponse;
import cl.veterinaria.mascotas_service.service.MascotaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/mascotas")
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;

    // Registrar una mascota
    @PostMapping
    public ResponseEntity<MascotaResponse> registrar(
            @Valid @RequestBody MascotaRequest request
    ) {

        MascotaResponse respuesta = mascotaService.registrar(request);

        return ResponseEntity
                .created(URI.create("/api/v1/mascotas/" + respuesta.id()))
                .body(respuesta);
    }

    // Listar todas las mascotas activas
    @GetMapping
    public ResponseEntity<List<MascotaResponse>> listar() {

        return ResponseEntity.ok(
                mascotaService.listar()
        );
    }

    // Listar las mascotas del usuario autenticado
    @GetMapping("/mias")
    public ResponseEntity<List<MascotaResponse>> listarMisMascotas() {

        return ResponseEntity.ok(
                mascotaService.listarMisMascotas()
        );
    }

    // Buscar una mascota por su ID
    @GetMapping("/{id}")
    public ResponseEntity<MascotaResponse> obtenerPorId(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                mascotaService.obtenerPorId(id)
        );
    }

    // Actualizar una mascota
    @PutMapping("/{id}")
    public ResponseEntity<MascotaResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MascotaRequest request
    ) {

        return ResponseEntity.ok(
                mascotaService.actualizar(id, request)
        );
    }

    // Desactivar una mascota (eliminación lógica)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(
            @PathVariable Long id
    ) {

        mascotaService.desactivar(id);

        return ResponseEntity.noContent().build();
    }
}
