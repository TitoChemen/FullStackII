
package cl.veterinaria.historial_service.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class MascotaClient {

    private final RestClient restClient;

    public MascotaClient(
            @Qualifier("loadBalancedRestClientBuilder")
            RestClient.Builder builder
    ) {
        this.restClient = builder
                .baseUrl("http://MASCOTAS-SERVICE")
                .build();
    }

    public MascotaInfo obtenerMascota(Long mascotaId, String jwt) {

        try {
            MascotaInfo mascota = restClient.get()
                    .uri("/api/v1/mascotas/{id}", mascotaId)
                    .headers(headers -> headers.setBearerAuth(jwt))
                    .retrieve()
                    .body(MascotaInfo.class);

            if (mascota == null ||
                    mascota.id() == null ||
                    !mascota.id().equals(mascotaId) ||
                    !Boolean.TRUE.equals(mascota.activo())) {

                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La mascota no existe o está inactiva"
                );
            }

            return mascota;

        } catch (HttpClientErrorException.NotFound ex) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La mascota no existe o está inactiva",
                    ex
            );

        } catch (HttpClientErrorException.Forbidden ex) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para consultar esta mascota",
                    ex
            );

        } catch (HttpClientErrorException.Unauthorized ex) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "La autenticación fue rechazada por Mascotas",
                    ex
            );

        } catch (RestClientException ex) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No fue posible validar la mascota",
                    ex
            );
        }
    }

    public record MascotaInfo(
            Long id,
            Long duenoId,
            Boolean activo
    ) {
    }
}
