package com.logilink;

import com.logilink.config.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.DefaultCorsProcessor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CorsTests {

  private CorsConfigurationSource corsConfigurationSource;
  private DefaultCorsProcessor corsProcessor;

  @BeforeEach
  void setUp() {
    SecurityConfig securityConfig = new SecurityConfig();
    corsConfigurationSource = securityConfig.corsConfigurationSource(
        "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"
    );
    corsProcessor = new DefaultCorsProcessor();
  }

  @Test
  void corsConfig_allowsRequiredOriginsMethodsAndHeaders() {
    MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/forgot-password");
    CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);

    assertNotNull(config);
    assertTrue(config.getAllowCredentials());
    assertEquals(3600L, config.getMaxAge());

    List<String> allowedOrigins = config.getAllowedOrigins();
    assertNotNull(allowedOrigins);
    assertTrue(allowedOrigins.contains("http://localhost:5173"));
    assertTrue(allowedOrigins.contains("http://localhost:5174"));
    assertTrue(allowedOrigins.contains("http://127.0.0.1:5173"));
    assertTrue(allowedOrigins.contains("http://127.0.0.1:5174"));
    assertFalse(allowedOrigins.contains("http://malicious.domain.com"));

    List<String> allowedMethods = config.getAllowedMethods();
    assertNotNull(allowedMethods);
    assertTrue(allowedMethods.containsAll(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")));

    List<String> allowedHeaders = config.getAllowedHeaders();
    assertNotNull(allowedHeaders);
    assertTrue(allowedHeaders.contains("Authorization"));
    assertTrue(allowedHeaders.contains("Content-Type"));
  }

  @Test
  void preflightOptions_fromLocalhost5174_returnsProperCorsHeaders() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/forgot-password");
    request.addHeader("Origin", "http://localhost:5174");
    request.addHeader("Access-Control-Request-Method", "POST");
    request.addHeader("Access-Control-Request-Headers", "Authorization, Content-Type");

    CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    boolean passed = corsProcessor.processRequest(config, request, response);

    assertTrue(passed);
    assertEquals("http://localhost:5174", response.getHeader("Access-Control-Allow-Origin"));
    assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
    assertNotNull(response.getHeader("Access-Control-Allow-Methods"));
    assertTrue(response.getHeader("Access-Control-Allow-Methods").contains("POST"));
  }

  @Test
  void preflightOptions_fromLocalhost5173_returnsProperCorsHeaders() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/login");
    request.addHeader("Origin", "http://localhost:5173");
    request.addHeader("Access-Control-Request-Method", "POST");
    request.addHeader("Access-Control-Request-Headers", "Content-Type");

    CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    boolean passed = corsProcessor.processRequest(config, request, response);

    assertTrue(passed);
    assertEquals("http://localhost:5173", response.getHeader("Access-Control-Allow-Origin"));
    assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
  }

  @Test
  void preflightOptions_from127001Port5174_returnsProperCorsHeaders() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/reset-password");
    request.addHeader("Origin", "http://127.0.0.1:5174");
    request.addHeader("Access-Control-Request-Method", "POST");
    request.addHeader("Access-Control-Request-Headers", "Content-Type");

    CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    boolean passed = corsProcessor.processRequest(config, request, response);

    assertTrue(passed);
    assertEquals("http://127.0.0.1:5174", response.getHeader("Access-Control-Allow-Origin"));
    assertEquals("true", response.getHeader("Access-Control-Allow-Credentials"));
  }

  @Test
  void preflightOptions_fromUnauthorizedOrigin_isRejected() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/auth/forgot-password");
    request.addHeader("Origin", "http://untrusted-external-site.com");
    request.addHeader("Access-Control-Request-Method", "POST");

    CorsConfiguration config = corsConfigurationSource.getCorsConfiguration(request);
    MockHttpServletResponse response = new MockHttpServletResponse();

    boolean passed = corsProcessor.processRequest(config, request, response);

    assertFalse(passed);
    assertNull(response.getHeader("Access-Control-Allow-Origin"));
    assertEquals(403, response.getStatus());
  }
}
