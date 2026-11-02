package com.arogya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@RestController
@CrossOrigin(origins = "*") // Allows your frontend website to make requests to this backend
public class ArogyaApplication {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(ArogyaApplication.class, args);
    }

    // A simple test API endpoint to verify Supabase connection
    @GetMapping("/api/test-db")
    public String testDbConnection() {
        try {
            // This runs a very simple SQL check on Supabase
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "Success! Connected to Supabase. Query test returned: " + result;
        } catch (Exception e) {
            return "Failed to connect to Supabase. Error: " + e.getMessage();
        }
    }
}
