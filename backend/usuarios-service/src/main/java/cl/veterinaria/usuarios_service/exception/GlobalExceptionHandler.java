
package cl.veterinaria.usuarios_service.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.BadCredentialsException;

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacion(
            MethodArgumentNotValidException ex
    ) {
        String mensaje = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                        error.getField() + ": " +
                                error.getDefaultMessage()
                )
                .collect(Collectors.joining("; "));

        return respuesta(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> credenciales(
            BadCredentialsException ex
    ) {
        return respuesta(
                HttpStatus.UNAUTHORIZED,
                "Credenciales incorrectas"
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> estado(
            ResponseStatusException ex
    ) {
        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", ex.getStatusCode().value());
        body.put("mensaje", ex.getReason());

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> duplicado(
            DataIntegrityViolationException ex
    ) {
        return respuesta(
                HttpStatus.CONFLICT,
                "Los datos ingresados ya existen o incumplen una restricción"
        );
    }

    private ResponseEntity<Map<String, Object>> respuesta(
            HttpStatus estado,
            String mensaje
    ) {
        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", estado.value());
        body.put("mensaje", mensaje);

        return ResponseEntity.status(estado).body(body);
    }
}
