package com.citywatch.entity;

public enum Department {
    FIRE, MEDICAL, CRIME, ACCIDENT;

    public String displayName() {
        return switch (this) {
            case FIRE -> "Fire Department";
            case MEDICAL -> "Medical Department";
            case CRIME -> "Crime Department";
            case ACCIDENT -> "Accident Department";
        };
    }
}
