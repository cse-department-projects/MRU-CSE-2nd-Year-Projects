package com.arogya;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class SupabaseConnection {

    // You will replace these with your actual Supabase credentials
    private static final String URL = "jdbc:postgresql://db.lkaqliqkpkqlbcxcpsnm.supabase.co:5432/postgres";
    private static final String USER = "postgres.lkaqliqkpkqlbcxcpsnm";
    private static final String PASSWORD = "Komal@!#$%@";

    public static void main(String[] args) {
        System.out.println("Attempting to connect to Supabase...");
        
        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {
            if (conn != null) {
                System.out.println("Successfully connected to Supabase PostgreSQL!");
            } else {
                System.out.println("Failed to make connection!");
            }
        } catch (SQLException e) {
            System.err.println("PostgreSQL connection failed!");
            e.printStackTrace();
        }
    }
}
