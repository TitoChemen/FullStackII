package cl.veterinaria.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {

        return builder.routes()

                // Usuarios y autenticación
                .route("usuarios-service", r -> r
                        .path(
                                "/api/v1/usuarios/**",
                                "/api/v1/auth/**"
                        )
                        .uri("lb://USUARIOS-SERVICE")
                )

                // Mascotas
                .route("mascotas-service", r -> r
                        .path("/api/v1/mascotas/**")
                        .uri("lb://MASCOTAS-SERVICE")
                )

                // Citas
                .route("citas-service", r -> r
                        .path("/api/v1/citas/**")
                        .uri("lb://CITAS-SERVICE")
                )

                // Historial clínico
                .route("historial-service", r -> r
                        .path("/api/v1/historiales/**")
                        .uri("lb://HISTORIAL-SERVICE")
                )

                .build();
    }
}