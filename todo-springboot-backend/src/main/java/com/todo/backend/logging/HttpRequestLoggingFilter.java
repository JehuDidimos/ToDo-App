package com.todo.backend.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class HttpRequestLoggingFilter extends OncePerRequestFilter {
  private static final Logger log = LoggerFactory.getLogger(HttpRequestLoggingFilter.class);

  public static final String REQUEST_ID_HEADER = "X-Request-Id";
  public static final String REQUEST_ID_MDC_KEY = "requestId";

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.startsWith("/actuator");
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String incoming = request.getHeader(REQUEST_ID_HEADER);
    String requestId =
        (incoming == null || incoming.isBlank()) ? UUID.randomUUID().toString() : incoming.trim();

    MDC.put(REQUEST_ID_MDC_KEY, requestId);
    response.setHeader(REQUEST_ID_HEADER, requestId);

    long startNanos = System.nanoTime();
    log.info(
        "HTTP request start: {} {} from {}",
        request.getMethod(),
        request.getRequestURI(),
        request.getRemoteAddr());

    try {
      filterChain.doFilter(request, response);
    } finally {
      long durationMs = (System.nanoTime() - startNanos) / 1_000_000L;
      log.info(
          "HTTP request complete: {} {} -> status={} durationMs={}",
          request.getMethod(),
          request.getRequestURI(),
          response.getStatus(),
          durationMs);
      MDC.remove(REQUEST_ID_MDC_KEY);
    }
  }
}
