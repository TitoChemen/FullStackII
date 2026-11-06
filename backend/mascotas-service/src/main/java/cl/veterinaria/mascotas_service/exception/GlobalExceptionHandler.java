
package cl.veterinaria.mascotas_service.exception;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Errores de validación de los DTO
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        Map<String, String> detalles = new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        detalles.putIfAbsent(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return construirRespuesta(
                HttpStatus.BAD_REQUEST,
                "Los datos enviados no son válidos",
                request,
                detalles
        );
    }

    // Errores definidos por nuestra lógica de negocio
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> manejarEstado(
            ResponseStatusException ex,
            HttpServletRequest request
    ) {

        String mensaje = ex.getReason() != null
                ? ex.getReason()
                : "No se pudo procesar la solicitud";

        return construirRespuesta(
                ex.getStatusCode(),
                mensaje,
                request,
                null
        );
    }

    // JSON mal formado o datos con tipos incorrectos
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> manejarJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest request
    ) {

        return construirRespuesta(
                HttpStatus.BAD_REQUEST,
                "El JSON contiene datos inválidos o mal formateados",
                request,
                null
        );
    }

    // Conflictos de integridad en la base de datos
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> manejarBaseDeDatos(
            DataIntegrityViolationException ex,
            HttpServletRequest request
    ) {

        log.warn("Conflicto de integridad en la base de datos", ex);

        return construirRespuesta(
                HttpStatus.CONFLICT,
                "La operación genera un conflicto con los datos existentes",
                request,
                null
        );
    }

    // Rutas inexistentes
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> manejarRutaInexistente(
            NoResourceFoundException ex,
            HttpServletRequest request
    ) {

        return construirRespuesta(
                HttpStatus.NOT_FOUND,
                "La ruta solicitada no existe",
                request,
                null
        );
    }

    // Métodos HTTP no permitidos
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> manejarMetodoNoPermitido(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {

        return construirRespuesta(
                HttpStatus.METHOD_NOT_ALLOWED,
                "El método HTTP no está permitido para esta ruta",
                request,
                null
        );
    }

    // Errores inesperados
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarErrorGeneral(
            Exception ex,
            HttpServletRequest request
    ) {

        log.error("Error inesperado en mascotas-service", ex);

        return construirRespuesta(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error interno en el servidor",
                request,
                null
        );
    }

    // Formato común para las respuestas de error
    private ResponseEntity<Map<String, Object>> construirRespuesta(
            HttpStatusCode estado,
            String mensaje,
            HttpServletRequest request,
            Map<String, String> detalles
    ) {

        Map<String, Object> respuesta = new LinkedHashMap<>();

        HttpStatus estadoHttp = HttpStatus.resolve(estado.value());

        respuesta.put("timestamp", OffsetDateTime.now().toString());
        respuesta.put("status", estado.value());
        respuesta.put(
                "error",
                estadoHttp != null
                        ? estadoHttp.getReasonPhrase()
                        : "Error"
        );
        respuesta.put("message", mensaje);
        respuesta.put("path", request.getRequestURI());

        if (detalles != null && !detalles.isEmpty()) {
            respuesta.put("detalles", detalles);
        }

        return ResponseEntity
                .status(estado)
                .body(respuesta);
    }
}
