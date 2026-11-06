
package cl.veterinaria.usuarios_service.controller;

import cl.veterinaria.usuarios_service.dto.response.UsuarioResponse;
import cl.veterinaria.usuarios_service.service.UsuarioService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> miPerfil(
            @AuthenticationPrincipal Jwt jwt
    ) {
        Long id = Long.parseLong(jwt.getSubject());

        return ResponseEntity.ok(
                usuarioService.obtenerMiPerfil(id)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<UsuarioResponse>> listar() {

        return ResponseEntity.ok(
                usuarioService.listarUsuarios()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                usuarioService.buscarPorId(id)
        );
    }

    // Validación de propietarios para otros microservicios
    @GetMapping("/{id}/validacion-propietario")
    @PreAuthorize(
        "hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'DUENO_MASCOTA')"
    )
    public ResponseEntity<Map<String, Boolean>> validarPropietario(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {

        List<String> roles = jwt.getClaimAsStringList("roles");

        boolean esPersonal = roles != null &&
                (roles.contains("ADMINISTRADOR") ||
                 roles.contains("RECEPCIONISTA"));

        // Un propietario solo puede consultar su propio ID
        if (!esPersonal && !id.toString().equals(jwt.getSubject())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No puedes validar a otro propietario"
            );
        }

        boolean valido = usuarioService.esPropietarioValido(id);

        return ResponseEntity.ok(
                Map.of("valido", valido)
        );
    }

    // Validación de veterinarios para otros microservicios
    @GetMapping("/{id}/validacion-veterinario")
    @PreAuthorize(
            "hasAnyRole('ADMINISTRADOR', 'RECEPCIONISTA', 'VETERINARIO', 'DUENO_MASCOTA')"
    )
    public ResponseEntity<Map<String, Boolean>> validarVeterinario(
            @PathVariable Long id
    ) {

        boolean valido = usuarioService.esVeterinarioValido(id);

        return ResponseEntity.ok(
                Map.of("valido", valido)
        );
    }

}
