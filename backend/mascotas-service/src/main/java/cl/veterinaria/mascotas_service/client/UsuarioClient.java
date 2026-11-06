
package cl.veterinaria.mascotas_service.client;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Qualifier;

@Component
public class UsuarioClient {

    private final RestClient restClient;

    public UsuarioClient(
            @Qualifier("loadBalancedRestClientBuilder")
            RestClient.Builder restClientBuilder
    ) {
        this.restClient = restClientBuilder
                .clone()
                .baseUrl("http://USUARIOS-SERVICE")
                .build();
    }


    public void validarPropietario(
            Long duenoId,
            JwtAuthenticationToken autenticacion
    ) {

        if (duenoId == null || duenoId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del propietario no es válido"
            );
        }

        try {
            ValidacionPropietarioResponse respuesta = restClient
                    .get()
                    .uri(
                            "/api/v1/usuarios/{id}/validacion-propietario",
                            duenoId
                    )
                    .headers(headers -> headers.setBearerAuth(
                            autenticacion.getToken().getTokenValue()
                    ))
                    .retrieve()
                    .body(ValidacionPropietarioResponse.class);

            if (respuesta == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Usuarios respondió sin datos de validación"
                );
            }

            if (!respuesta.valido()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El propietario no existe, está inactivo o no tiene el rol requerido"
                );
            }

        } catch (RestClientResponseException ex) {

            int codigo = ex.getStatusCode().value();

            if (codigo == 401) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "La autenticación fue rechazada por Usuarios",
                        ex
                );
            }

            if (codigo == 403) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No tienes permiso para validar este propietario",
                        ex
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Usuarios no pudo completar la validación",
                    ex
            );

        } catch (RestClientException ex) {

            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No fue posible comunicarse con Usuarios",
                    ex
            );
        }
    }

    public record ValidacionPropietarioResponse(boolean valido) {
    }
}
