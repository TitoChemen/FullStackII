
package cl.veterinaria.historial_service.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class UsuarioClient {

    private final RestClient restClient;

    public UsuarioClient(
            @Qualifier("loadBalancedRestClientBuilder")
            RestClient.Builder builder
    ) {
        this.restClient = builder
                .baseUrl("http://USUARIOS-SERVICE")
                .build();
    }

    public void validarVeterinario(
            Long veterinarioId,
            String jwt
    ) {

        if (veterinarioId == null || veterinarioId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El ID del veterinario no es válido"
            );
        }

        try {

            ValidacionVeterinarioResponse respuesta =
                    restClient.get()
                            .uri(
                                    "/api/v1/usuarios/{id}/validacion-veterinario",
                                    veterinarioId
                            )
                            .headers(headers ->
                                    headers.setBearerAuth(jwt)
                            )
                            .retrieve()
                            .body(ValidacionVeterinarioResponse.class);

            if (respuesta == null ||
                    !Boolean.TRUE.equals(respuesta.valido())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El usuario indicado no es un veterinario activo"
                );
            }

        } catch (HttpClientErrorException.NotFound ex) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No se encontró el veterinario indicado",
                    ex
            );

        } catch (HttpClientErrorException.Forbidden ex) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para validar este veterinario",
                    ex
            );

        } catch (HttpClientErrorException.Unauthorized ex) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "La autenticación fue rechazada por Usuarios",
                    ex
            );

        } catch (RestClientException ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No fue posible validar el veterinario",
                    ex
            );
        }
    }

    public record ValidacionVeterinarioResponse(
            Boolean valido
    ) {
    }
}
