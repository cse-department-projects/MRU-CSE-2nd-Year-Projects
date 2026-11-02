package com.resqnet.dto.auth;

import com.resqnet.enums.Role;

public class AuthResponse {

    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private Object profile;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String email, String fullName, Role role, Object profile) {
        this.token = token;
        this.type = "Bearer";
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.profile = profile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Object getProfile() {
        return profile;
    }

    public void setProfile(Object profile) {
        this.profile = profile;
    }
}
