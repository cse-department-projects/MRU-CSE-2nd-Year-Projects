package com.logilink.controller;

import com.logilink.entity.Organization;
import com.logilink.security.TenantContext;
import com.logilink.service.geo.GeoLocation;
import com.logilink.service.geo.GeocodingService;
import com.logilink.service.geo.RouteResult;
import com.logilink.service.geo.RoutingService;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/geo")
public class GeoController {
  private final GeocodingService geocodingService;
  private final RoutingService routingService;
  private final TenantContext tenantContext;

  public GeoController(GeocodingService geocodingService, RoutingService routingService, TenantContext tenantContext) {
    this.geocodingService = geocodingService;
    this.routingService = routingService;
    this.tenantContext = tenantContext;
  }

  @GetMapping("/search")
  public List<GeoLocation> search(@RequestParam(name = "q", defaultValue = "") String query) {
    Organization org = tenantContext.getCurrentOrganization();
    return geocodingService.search(query, org);
  }

  @PostMapping("/route")
  public RouteResult calculateRoute(@RequestBody Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    GeoLocation origin = parseLocation(body.get("origin"), body.get("originLat"), body.get("originLng"), org);
    GeoLocation destination = parseLocation(body.get("destination"), body.get("destinationLat"), body.get("destinationLng"), org);
    List<GeoLocation> stops = parseStops(body.get("stops"), body.get("stopCoords"), org);

    return routingService.calculateRoute(origin, destination, stops);
  }

  @PostMapping("/optimize")
  public RouteResult optimizeRoute(@RequestBody Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    GeoLocation origin = parseLocation(body.get("origin"), body.get("originLat"), body.get("originLng"), org);
    GeoLocation destination = parseLocation(body.get("destination"), body.get("destinationLat"), body.get("destinationLng"), org);
    List<GeoLocation> stops = parseStops(body.get("stops"), body.get("stopCoords"), org);

    return routingService.optimizeRoute(origin, destination, stops);
  }

  private GeoLocation parseLocation(Object nameObj, Object latObj, Object lngObj, Organization org) {
    String name = nameObj != null ? nameObj.toString().trim() : "Unknown Location";
    if (latObj != null && lngObj != null) {
      try {
        double lat = Double.parseDouble(latObj.toString());
        double lng = Double.parseDouble(lngObj.toString());
        return new GeoLocation(name, lat, lng, "location");
      } catch (NumberFormatException ignored) {}
    }
    return geocodingService.geocode(name, org).orElse(new GeoLocation(name, 17.3850, 78.4867, "city"));
  }

  @SuppressWarnings("unchecked")
  private List<GeoLocation> parseStops(Object stopsObj, Object stopCoordsObj, Organization org) {
    List<GeoLocation> result = new ArrayList<>();
    if (stopCoordsObj instanceof List<?> list && !list.isEmpty()) {
      for (Object item : list) {
        if (item instanceof Map<?, ?> map) {
          String sName = map.get("name") != null ? map.get("name").toString() : "Stop";
          Object lat = map.get("lat") != null ? map.get("lat") : map.get("latitude");
          Object lng = map.get("lng") != null ? map.get("lng") : map.get("longitude");
          if (lat != null && lng != null) {
            try {
              result.add(new GeoLocation(sName, Double.parseDouble(lat.toString()), Double.parseDouble(lng.toString()), "stop"));
            } catch (Exception ignored) {}
          }
        }
      }
      if (!result.isEmpty()) return result;
    }

    if (stopsObj != null) {
      String stopsStr = stopsObj.toString();
      if (!stopsStr.isBlank()) {
        String[] parts = stopsStr.split("[,;]+");
        for (String p : parts) {
          String clean = p.trim();
          if (!clean.isEmpty()) {
            result.add(geocodingService.geocode(clean, org).orElse(new GeoLocation(clean, 17.1439, 79.6239, "stop")));
          }
        }
      }
    }
    return result;
  }
}
