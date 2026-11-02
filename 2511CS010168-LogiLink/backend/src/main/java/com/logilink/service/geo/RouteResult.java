package com.logilink.service.geo;

import java.util.*;

public class RouteResult {
  public String origin;
  public String destination;
  public String stops;
  public String distance;
  public Double distanceKm;
  public String estimatedTime;
  public Long durationSeconds;
  public String fuelEstimate;
  public List<List<Double>> geometry = new ArrayList<>(); // [[lat, lng], [lat, lng], ...]
  public List<GeoLocation> waypoints = new ArrayList<>();
  public List<String> originalOrder = new ArrayList<>();
  public List<String> optimizedOrder = new ArrayList<>();
  public Map<String, Object> original = new LinkedHashMap<>();
  public Map<String, Object> optimized = new LinkedHashMap<>();
  public Map<String, Object> savings = new LinkedHashMap<>();
  public List<Double> bounds = new ArrayList<>(); // [minLat, minLng, maxLat, maxLng]

  public RouteResult() {}
}
