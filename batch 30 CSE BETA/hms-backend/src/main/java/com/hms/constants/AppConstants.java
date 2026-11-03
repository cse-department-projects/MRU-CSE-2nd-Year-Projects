package com.hms.constants;

public final class AppConstants {

    private AppConstants() {}

    // Roles
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_DOCTOR = "ROLE_DOCTOR";
    public static final String ROLE_PATIENT = "ROLE_PATIENT";

    // Pagination defaults
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIR = "desc";

    // JWT
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";

    // Status messages
    public static final String SUCCESS = "success";
    public static final String ERROR = "error";

    // Appointment statuses
    public static final String APPOINTMENT_PENDING = "PENDING";
    public static final String APPOINTMENT_CONFIRMED = "CONFIRMED";
    public static final String APPOINTMENT_COMPLETED = "COMPLETED";
    public static final String APPOINTMENT_CANCELLED = "CANCELLED";

    // Payment statuses
    public static final String PAYMENT_PENDING = "PENDING";
    public static final String PAYMENT_PAID = "PAID";
    public static final String PAYMENT_PARTIAL = "PARTIAL";

    // Default GST rate
    public static final double DEFAULT_GST_RATE = 18.0;

    // Low stock threshold default
    public static final int DEFAULT_LOW_STOCK_THRESHOLD = 10;

    // Invoice prefix
    public static final String INVOICE_PREFIX = "INV";

    // Date formats
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
}
