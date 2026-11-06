
package cl.veterinaria.mascotas_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.util.Base64;

@Configuration
public class JwtConfig {

    @Bean
    public JwtDecoder jwtDecoder(
            @Value("${app.jwt.secret}") String secretBase64,
            @Value("${app.jwt.issuer}") String issuer
    ) {

        byte[] secretBytes;

        try {
            secretBytes = Base64.getDecoder().decode(secretBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                    "JWT_SECRET debe contener una clave válida en Base64",
                    e
            );
        }

        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos 32 bytes"
            );
        }

        SecretKey secretKey = new SecretKeySpec(
                secretBytes,
                "HmacSHA256"
        );

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        decoder.setJwtValidator(
                JwtValidators.createDefaultWithIssuer(issuer)
        );

        return decoder;
    }
}
