package com.arogya;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for all user-related API operations.
 * Acts as the middleware between the React frontend and Supabase PostgreSQL.
 *
 * Endpoints:
 *   POST /api/users/register  — create a new account (hashes password with BCrypt)
 *   POST /api/users/login     — verify credentials and return user profile
 *   GET  /api/users/profile   — fetch user info by email
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allow requests from the React frontend
public class UserController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ---------------------------------------------------------------------------
    // RowMapper — converts a DB row into a safe User object (no password exposed)
    // ---------------------------------------------------------------------------
    private final RowMapper<Map<String, Object>> safeUserMapper = (rs, rowNum) -> {
        Map<String, Object> user = new HashMap<>();
        user.put("id", rs.getLong("id"));
        user.put("name", rs.getString("name"));
        user.put("email", rs.getString("email"));
        user.put("createdAt", rs.getString("created_at"));
        return user;
    };

    // ---------------------------------------------------------------------------
    // POST /api/users/register
    // Receives: { name, email, password }
    // Saves a new user with a BCrypt-hashed password to the "user" table
    // ---------------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody User user) {
        try {
            // 1. Validate required fields
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Name is required."));
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
            }
            if (user.getPassword() == null || user.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 6 characters."));
            }

            // 2. Check if email already exists
            String checkSql = "SELECT COUNT(*) FROM \"user\" WHERE email = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, user.getEmail().trim().toLowerCase());
            if (count != null && count > 0) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("An account with this email already exists."));
            }

            // 3. Hash the password before saving (NEVER store plain text!)
            String hashedPassword = passwordEncoder.encode(user.getPassword());

            // 4. Insert into Supabase
            // Note: "user" is a reserved word in PostgreSQL, so we use double quotes.
            String sql = "INSERT INTO \"user\" (name, email, password) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql,
                    user.getName().trim(),
                    user.getEmail().trim().toLowerCase(),
                    hashedPassword);

            // 5. Fetch the newly created user to return their ID
            String fetchSql = "SELECT id, name, email, created_at FROM \"user\" WHERE email = ?";
            Map<String, Object> newUser = jdbcTemplate.queryForObject(fetchSql, safeUserMapper,
                    user.getEmail().trim().toLowerCase());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Account created successfully!", newUser));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    // ---------------------------------------------------------------------------
    // POST /api/users/login
    // Receives: { email, password }
    // Verifies credentials against Supabase and returns the user's profile
    // ---------------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            // 1. Validate required fields
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is required."));
            }
            if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Password is required."));
            }

            // 2. Look up user by email (case-insensitive)
            String sql = "SELECT id, name, email, password, created_at FROM \"user\" WHERE email = ?";
            List<Map<String, Object>> rows = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("id", rs.getLong("id"));
                row.put("name", rs.getString("name"));
                row.put("email", rs.getString("email"));
                row.put("password", rs.getString("password")); // hashed password for verification
                row.put("createdAt", rs.getString("created_at"));
                return row;
            }, loginRequest.getEmail().trim().toLowerCase());

            // 3. User not found
            if (rows.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("No account found with that email address."));
            }

            Map<String, Object> dbUser = rows.get(0);
            String storedHashedPassword = (String) dbUser.get("password");

            // 4. Verify password against the BCrypt hash
            boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), storedHashedPassword);
            if (!passwordMatches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Incorrect password. Please try again."));
            }

            // 5. Build safe response (exclude password hash!)
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", dbUser.get("id"));
            safeUser.put("name", dbUser.get("name"));
            safeUser.put("email", dbUser.get("email"));
            safeUser.put("createdAt", dbUser.get("createdAt"));

            return ResponseEntity.ok(ApiResponse.ok("Login successful!", safeUser));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    // ---------------------------------------------------------------------------
    // GET /api/users/profile?email=someone@example.com
    // Returns the user's profile data for the Patient Dashboard
    // ---------------------------------------------------------------------------
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getUserProfile(@RequestParam String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email parameter is required."));
            }

            String sql = "SELECT id, name, email, created_at FROM \"user\" WHERE email = ?";
            List<Map<String, Object>> rows = jdbcTemplate.query(sql, safeUserMapper,
                    email.trim().toLowerCase());

            if (rows.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found."));
            }

            return ResponseEntity.ok(ApiResponse.ok("Profile fetched.", rows.get(0)));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch profile: " + e.getMessage()));
        }
    }
}
