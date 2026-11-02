package com.logilink.controller;

import com.logilink.service.AnalyticsService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AnalyticsController {
  private final AnalyticsService analytics;

  public AnalyticsController(AnalyticsService analytics) {
    this.analytics = analytics;
  }

  @GetMapping("/analytics/dashboard")
  public Map<String, Object> dashboard() {
    return analytics.dashboard();
  }

  @GetMapping("/analytics")
  public Map<String, Object> analytics(
      @RequestParam(required = false) String range,
      @RequestParam(required = false) Integer days) {
    return analytics.analytics(range, days);
  }

  @GetMapping("/analytics/summary")
  public Map<String, Object> summary() {
    return analytics.summary();
  }

  @GetMapping("/analytics/orders")
  public Map<String, Object> orderAnalytics(
      @RequestParam(required = false) String range,
      @RequestParam(required = false) Integer days) {
    return analytics.orderAnalytics(range, days);
  }

  @GetMapping("/analytics/shipments")
  public Map<String, Object> shipmentAnalytics(
      @RequestParam(required = false) String range,
      @RequestParam(required = false) Integer days) {
    return analytics.shipmentAnalytics(range, days);
  }

  @GetMapping("/analytics/fleet")
  public Map<String, Object> fleetAnalytics() {
    return analytics.fleetAnalytics();
  }

  @GetMapping("/analytics/drivers")
  public Map<String, Object> driverAnalytics() {
    return analytics.driverAnalytics();
  }

  @GetMapping("/analytics/routes")
  public Map<String, Object> routeAnalytics() {
    return analytics.routeAnalytics();
  }

  @GetMapping("/analytics/warehouses")
  public Map<String, Object> warehouseAnalytics() {
    return analytics.warehouseAnalytics();
  }

  @GetMapping("/analytics/inventory")
  public Map<String, Object> inventoryAnalytics() {
    return analytics.inventoryAnalytics();
  }
}
