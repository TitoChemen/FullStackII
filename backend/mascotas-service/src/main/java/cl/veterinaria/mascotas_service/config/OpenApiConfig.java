
package cl.veterinaria.mascotas_service.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;

import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Veterinaria San Marcos - API de Mascotas",
                version = "1.0.0",
                description = """
                        Microservicio encargado de la gestión de mascotas
                        de Veterinaria San Marcos.

                        Funcionalidades:
                        - Registro de mascotas.
                        - Consulta de mascotas por propietario.
                        - Consulta individual de pacientes.
                        - Actualización de información.
                        - Desactivación lógica de mascotas.

                        Los endpoints requieren autenticación JWT
                        y aplican permisos según el rol del usuario.
                        """,
                contact = @Contact(
                        name = "Equipo de Desarrollo - Veterinaria San Marcos"
                ),
                license = @License(
                        name = "Uso académico"
                )
        ),
        security = {
                @SecurityRequirement(name = "bearerAuth")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Introduce el JWT obtenido desde usuarios-service"
)
public class OpenApiConfig {
}
