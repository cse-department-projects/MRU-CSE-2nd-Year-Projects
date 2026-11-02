package com.logilink.service.geo;

public class GeoLocation {
  public String name;
  public String displayName;
  public Double latitude;
  public Double longitude;
  public String type; // "warehouse", "hub", "city", "location"
  public String state;
  public String country;

  public GeoLocation() {}

  public GeoLocation(String name, String displayName, Double latitude, Double longitude, String type) {
    this.name = name;
    this.displayName = displayName;
    this.latitude = latitude;
    this.longitude = longitude;
    this.type = type;
  }

  public GeoLocation(String name, Double latitude, Double longitude, String type) {
    this(name, name, latitude, longitude, type);
  }
}
