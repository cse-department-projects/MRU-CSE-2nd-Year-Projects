package com.arogya;

/**
 * Standard API response wrapper returned by all endpoints.
 * Provides consistent JSON shape: { success, message, data }
 */
public class ApiResponse {

    private boolean success;
    private String message;
    private Object data;

    // Success response with data payload
    public static ApiResponse ok(String message, Object data) {
        ApiResponse r = new ApiResponse();
        r.success = true;
        r.message = message;
        r.data = data;
        return r;
    }

    // Success response without data
    public static ApiResponse ok(String message) {
        return ok(message, null);
    }

    // Error response
    public static ApiResponse error(String message) {
        ApiResponse r = new ApiResponse();
        r.success = false;
        r.message = message;
        r.data = null;
        return r;
    }

    // Getters (required for Jackson JSON serialization)
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Object getData() { return data; }
}
