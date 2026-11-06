
package cl.veterinaria.usuarios_service.security;

import cl.veterinaria.usuarios_service.entity.Usuario;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class JwtService {

    private static final Duration DURACION =
            Duration.ofMinutes(30);

    private final JwtEncoder jwtEncoder;
    private final String issuer;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.issuer}") String issuer
    ) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
    }

    public String generarToken(Usuario usuario) {

        Instant ahora = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(ahora)
                .expiresAt(ahora.plus(DURACION))
                .subject(usuario.getId().toString())
                .claim("email", usuario.getCorreo())
                .claim("roles", List.of(usuario.getRol().name()))
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        return jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }

    public long obtenerDuracionSegundos() {
        return DURACION.toSeconds();
    }
}
