
package cl.veterinaria.usuarios_service.controller;

import cl.veterinaria.usuarios_service.dto.request.LoginRequest;
import cl.veterinaria.usuarios_service.dto.request.RegistroRequest;
import cl.veterinaria.usuarios_service.dto.response.AuthResponse;
import cl.veterinaria.usuarios_service.dto.response.UsuarioResponse;
import cl.veterinaria.usuarios_service.service.AuthService;

import jakarta.validation.Valid;

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
}
