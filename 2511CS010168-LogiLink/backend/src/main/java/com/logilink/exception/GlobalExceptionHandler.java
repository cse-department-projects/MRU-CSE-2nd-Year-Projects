package com.logilink.exception;

import com.logilink.dto.ApiError;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> notFound(ResourceNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of(404, "Not Found", ex.getMessage()));
  }

  @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
  ResponseEntity<ApiError> noResource(org.springframework.web.servlet.resource.NoResourceFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiError.of(404, "Not Found", ex.getMessage()));
  }

  @ExceptionHandler(ConflictException.class)
  ResponseEntity<ApiError> conflict(ConflictException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiError.of(409, "Conflict", ex.getMessage()));
  }

  @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
  ResponseEntity<ApiError> badRequest(RuntimeException ex) {
    return ResponseEntity.badRequest().body(ApiError.of(400, "Bad Request", ex.getMessage()));
  }

  @ExceptionHandler(BadCredentialsException.class)
  ResponseEntity<ApiError> badCredentials() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of(401, "Unauthorized", "Invalid email or password."));
  }

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiError> denied() {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiError.of(403, "Forbidden", "You do not have permission to perform this action."));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
    Map<String, String> validation = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> validation.put(error.getField(), error.getDefaultMessage()));
    return ResponseEntity.badRequest().body(new ApiError(Instant.now(), 400, "Bad Request", "Validation failed.", validation));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiError> general(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiError.of(500, "Internal Server Error", "The request could not be completed."));
  }
}
