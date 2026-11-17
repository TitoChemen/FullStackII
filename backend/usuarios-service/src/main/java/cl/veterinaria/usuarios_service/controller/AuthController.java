
package cl.veterinaria.usuarios_service.controller;

import cl.veterinaria.usuarios_service.dto.request.LoginRequest;
import cl.veterinaria.usuarios_service.dto.request.RegistroRequest;
import cl.veterinaria.usuarios_service.dto.response.AuthResponse;
import cl.veterinaria.usuarios_service.dto.response.UsuarioResponse;
import cl.veterinaria.usuarios_service.service.AuthService;

import jakarta.validation.Valid;


import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody RegistroRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }

        @PostMapping("/refresh")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<AuthResponse> refrescar(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(
                authService.refrescar(Long.parseLong(jwt.getSubject()))
        );
    }
}
