package cl.veterinaria.historial_service.controller;

import cl.veterinaria.historial_service.dto.request.HistorialRequest;
import cl.veterinaria.historial_service.dto.response.HistorialResponse;
import cl.veterinaria.historial_service.service.HistorialService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/historiales")
@Validated
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    @PostMapping
    public ResponseEntity<HistorialResponse> registrar(
            @Valid @RequestBody HistorialRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        HistorialResponse response = historialService.registrar(
                request,
                jwt
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public HistorialResponse obtenerPorId(
            @PathVariable @Positive Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return historialService.obtenerPorId(id, jwt);
    }

    @GetMapping("/mascota/{mascotaId}")
    public List<HistorialResponse> obtenerPorMascota(
            @PathVariable @Positive Long mascotaId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return historialService.obtenerPorMascota(
                mascotaId,
                jwt
        );
    }

    @GetMapping("/veterinario/{veterinarioId}")
    public List<HistorialResponse> obtenerPorVeterinario(
            @PathVariable @Positive Long veterinarioId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return historialService.obtenerPorVeterinario(
                veterinarioId,
                jwt
        );
    }

    @GetMapping("/cita/{citaId}")
    public HistorialResponse obtenerPorCita(
            @PathVariable @Positive Long citaId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return historialService.obtenerPorCita(citaId, jwt);
    }
}
