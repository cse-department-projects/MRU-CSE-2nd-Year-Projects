package com.arogya;

/**
 * POJO for receiving login credentials from the frontend.
 * Maps to: { "email": "...", "password": "..." }
 */
public class LoginRequest {

    private String email;
    private String password;

    // Getters and Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
