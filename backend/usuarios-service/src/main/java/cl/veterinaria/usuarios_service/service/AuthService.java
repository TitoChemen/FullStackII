
package cl.veterinaria.usuarios_service.service;

import cl.veterinaria.usuarios_service.dto.request.LoginRequest;
import cl.veterinaria.usuarios_service.dto.request.RegistroRequest;
import cl.veterinaria.usuarios_service.dto.response.AuthResponse;
import cl.veterinaria.usuarios_service.dto.response.UsuarioResponse;

import cl.veterinaria.usuarios_service.entity.Usuario;
import cl.veterinaria.usuarios_service.enums.Rol;
import cl.veterinaria.usuarios_service.repository.UsuarioRepository;
import cl.veterinaria.usuarios_service.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UsuarioResponse registrar(RegistroRequest request) {

        String correo = normalizarCorreo(request.correo());

        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El correo ya está registrado"
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setCorreo(correo);

        usuario.setContrasenaHash(
                passwordEncoder.encode(request.contrasena())
        );

        // El usuario público no puede elegir su propio rol
        usuario.setRol(Rol.DUENO_MASCOTA);
        usuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(usuario);

        return UsuarioResponse.fromEntity(guardado);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String correo = normalizarCorreo(request.correo());

        Usuario usuario = usuarioRepository
                .findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadCredentialsException(
                        "Credenciales incorrectas"
                ));

        if (!usuario.isActivo()
                || !passwordEncoder.matches(
                request.contrasena(),
                usuario.getContrasenaHash()
        )) {
            throw new BadCredentialsException(
                    "Credenciales incorrectas"
            );
        }

        String token = jwtService.generarToken(usuario);

        return new AuthResponse(
                token,
                "Bearer",
                jwtService.obtenerDuracionSegundos(),
                UsuarioResponse.fromEntity(usuario)
        );
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }
}
