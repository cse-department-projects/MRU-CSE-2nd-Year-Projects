package com.citywatch.service;

import com.citywatch.dto.AuthDtos;
import com.citywatch.entity.*;
import com.citywatch.repository.*;
import com.citywatch.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class UserService {
    private final AppUserRepository users;
    private final AuthorityProfileRepository authorities;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public UserService(AppUserRepository users, AuthorityProfileRepository authorities,
                       PasswordEncoder encoder, JwtService jwt) {
        this.users = users; this.authorities = authorities; this.encoder = encoder; this.jwt = jwt;
    }

    public AuthDtos.AuthResponse registerCitizen(AuthDtos.CitizenRegisterRequest req) {
        if (users.existsByEmailIgnoreCase(req.email()))
            throw new IllegalArgumentException("An account with this email already exists.");

        AppUser u = new AppUser();
        u.setUserCode(nextCode("CIT"));
        u.setName(req.name());
        u.setEmail(req.email().toLowerCase());
        u.setPhone(req.phone());
        u.setPassword(encoder.encode(req.password()));
        u.setRole(Role.CITIZEN);
        users.save(u);
        return response(u, null);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        AppUser u = users.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));
        if (!encoder.matches(req.password(), u.getPassword()))
            throw new IllegalArgumentException("Invalid email or password.");

        Department d = u.getRole() == Role.AUTHORITY
                ? authorities.findByUserId(u.getId()).map(AuthorityProfile::getDepartment).orElse(null)
                : null;
        return response(u, d);
    }

    private AuthDtos.AuthResponse response(AppUser u, Department department) {
        return new AuthDtos.AuthResponse(
                jwt.generate(u.getId(), u.getEmail(), u.getRole().name()),
                u.getUserCode(), u.getName(), u.getRole().name(),
                department == null ? null : department.displayName());
    }

    private String nextCode(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
