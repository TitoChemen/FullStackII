package cl.veterinaria.historial_service.client;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CitaClient {

    private final RestClient restClient;

    public CitaClient(
            @Qualifier("loadBalancedRestClientBuilder")
            RestClient.Builder builder
    ) {
        this.restClient = builder
                .baseUrl("http://CITAS-SERVICE")
                .build();
    }

    public CitaInfo obtenerCita(Long citaId, String jwt) {

        try {
            CitaInfo cita = restClient.get()
                    .uri("/api/v1/citas/{id}", citaId)
                    .headers(headers -> headers.setBearerAuth(jwt))
                    .retrieve()
                    .body(CitaInfo.class);

            if (cita == null || cita.id() == null ||
                    !cita.id().equals(citaId)) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "La cita indicada no existe"
                );
            }

            return cita;

        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "La cita indicada no existe", ex
            );
        } catch (HttpClientErrorException.Forbidden ex) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para consultar esta cita", ex
            );
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "La autenticación fue rechazada por Citas", ex
            );
        } catch (RestClientException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No fue posible consultar la cita", ex
            );
        }
    }

    public record CitaInfo(
            Long id,
            Long mascotaId,
            Long veterinarioId,
            String estado
    ) {}
}
