package cl.veterinaria.historial_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> manejarEstado(
            ResponseStatusException ex
    ) {
        return respuesta(
                ex.getStatusCode().value(),
                ex.getReason() == null
                        ? "Error en la solicitud"
                        : ex.getReason()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            MethodArgumentNotValidException ex
    ) {
        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " +
                        error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return respuesta(HttpStatus.BAD_REQUEST.value(), mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGeneral(
            Exception ex
    ) {
        return respuesta(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ocurrió un error interno en el servicio"
        );
    }

    private ResponseEntity<Map<String, Object>> respuesta(
            int codigo,
            String mensaje
    ) {
        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", codigo);
        body.put("message", mensaje);

        return ResponseEntity.status(codigo).body(body);
    }
}
