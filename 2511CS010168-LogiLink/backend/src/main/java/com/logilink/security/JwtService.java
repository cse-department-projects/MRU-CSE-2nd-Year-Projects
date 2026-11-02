package com.logilink.security;

import com.logilink.entity.AppUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final String secret;
  private final long expirationMs;

  public JwtService(@Value("${logilink.jwt.secret}") String secret, @Value("${logilink.jwt.expiration-ms}") long expirationMs) {
    this.secret = secret;
    this.expirationMs = expirationMs;
  }

  public String generate(AppUser user) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(user.email)
        .claim("role", user.role.name())
        .claim("name", user.name)
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expirationMs)))
        .signWith(key())
        .compact();
  }

  public String subject(String token) {
    return claims(token).getSubject();
  }

  public boolean valid(String token) {
    return claims(token).getExpiration().after(new Date());
  }

  private Claims claims(String token) {
    return Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token).getPayload();
  }

  private Key key() {
    try {
      return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    } catch (Exception ex) {
      byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
      if (bytes.length < 32) {
        byte[] padded = new byte[32];
        System.arraycopy(bytes, 0, padded, 0, bytes.length);
        return Keys.hmacShaKeyFor(padded);
      }
      return Keys.hmacShaKeyFor(bytes);
    }
  }
}
