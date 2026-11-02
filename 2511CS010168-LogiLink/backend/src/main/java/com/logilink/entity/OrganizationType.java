package com.logilink.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum OrganizationType {
  COMPANY("COMPANY"),
  CARRIER("CARRIER"),
  THREE_PL("3PL"),
  INDIVIDUAL("INDIVIDUAL");

  private final String value;

  OrganizationType(String value) {
    this.value = value;
  }

  @JsonValue
  public String getValue() {
    return value;
  }

  @JsonCreator
  public static OrganizationType fromString(String input) {
    if (input == null) return null;
    String clean = input.trim().toUpperCase();
    if ("3PL".equals(clean) || "_3PL".equals(clean) || "THREE_PL".equals(clean)) {
      return THREE_PL;
    }
    for (OrganizationType type : values()) {
      if (type.name().equalsIgnoreCase(clean) || type.value.equalsIgnoreCase(clean)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown organization type: " + input);
  }
}
