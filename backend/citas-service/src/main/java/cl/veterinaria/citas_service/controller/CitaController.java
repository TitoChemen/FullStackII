
package cl.veterinaria.citas_service.controller;

import cl.veterinaria.citas_service.dto.request.CitaRequest;
import cl.veterinaria.citas_service.dto.response.CitaResponse;
import cl.veterinaria.citas_service.service.CitaService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import cl.veterinaria.citas_service.dto.request.AsignarVeterinarioRequest;

import cl.veterinaria.citas_service.dto.request.CambiarEstadoCitaRequest;
import org.springframework.web.bind.annotation.PatchMapping;

import java.util.List;

@RestController
@RequestMapping("/api/v1/citas")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CitaController {

    private final CitaService citaService;

    // Registrar una nueva cita
    @PostMapping
    public ResponseEntity<CitaResponse> registrar(
            @Valid @RequestBody CitaRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        CitaResponse respuesta = citaService.registrar(request, jwt);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(respuesta);
    }

    // Consultar una cita por su ID
    @GetMapping("/{id}")
    public ResponseEntity<CitaResponse> obtenerPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                citaService.obtenerPorId(id, jwt)
        );
    }

    // Consultar las citas de una mascota
    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<CitaResponse>> listarPorMascota(
            @PathVariable Long mascotaId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                citaService.listarPorMascota(mascotaId, jwt)
        );
    }

    // Consultar las citas asignadas a un veterinario
    @GetMapping("/veterinario/{veterinarioId}")
    public ResponseEntity<List<CitaResponse>> listarPorVeterinario(
            @PathVariable Long veterinarioId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        return ResponseEntity.ok(
                citaService.listarPorVeterinario(veterinarioId, jwt)
        );
    }


    @PatchMapping("/{id}/estado")
    public ResponseEntity<CitaResponse> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoCitaRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        CitaResponse respuesta = citaService.cambiarEstado(
                id,
                request,
                jwt
        );

        return ResponseEntity.ok(respuesta);
    }


    @PatchMapping("/{id}/veterinario")
    public ResponseEntity<CitaResponse> asignarVeterinario(
            @PathVariable Long id,
            @Valid @RequestBody AsignarVeterinarioRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        CitaResponse respuesta = citaService.asignarVeterinario(
                id,
                request,
                jwt
        );

        return ResponseEntity.ok(respuesta);
    }


}
