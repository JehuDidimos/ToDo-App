package com.todo.backend.error;

import java.net.URI;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex) {
    String message =
        ex.getBindingResult().getFieldErrors().stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining("; "));

    log.warn("Validation failed: {}", message);

    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, message);
    problem.setTitle("Validation failed");
    problem.setType(URI.create("about:blank"));
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ProblemDetail> handleUnreadable(HttpMessageNotReadableException ex) {
    log.warn("Malformed request body: {}", ex.getMessage());

    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Malformed JSON request body");
    problem.setTitle("Bad request");
    problem.setType(URI.create("about:blank"));
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ProblemDetail> handleUnexpected(Exception ex) {
    log.error("Unhandled server error", ex);

    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    problem.setTitle("Internal server error");
    problem.setType(URI.create("about:blank"));
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
  }
}
