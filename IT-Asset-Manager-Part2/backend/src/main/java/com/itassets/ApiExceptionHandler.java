package com.itassets;

import java.util.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {
    public record ErrorResponse(String message, Map<String, String> errors) {}
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> application(ApiException ex) { return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage(), ex.getErrors())); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e -> errors.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new ErrorResponse("Please fix the highlighted fields.", errors));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> malformed(Exception ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse("Invalid request. Check JSON, dates, numbers and query parameters.", Map.of()));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> conflict(DataIntegrityViolationException ex) {
        // The unique constraint also protects against concurrent duplicate submissions.
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("The asset conflicts with stored data.", Map.of("serialNumber", "Another asset already has this serial number.")));
    }
}
