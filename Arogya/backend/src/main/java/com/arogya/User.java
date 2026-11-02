package com.arogya;

/**
 * Represents a user stored in the Supabase "user" table.
 * Used for registration, login, and profile responses.
 */
public class User {

    private Long id;
    private String name;
    private String email;
    private String password;   // Stored as BCrypt hash — never returned to frontend
    private String createdAt;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
