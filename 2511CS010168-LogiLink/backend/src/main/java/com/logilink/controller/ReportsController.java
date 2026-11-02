package com.logilink.controller;

import com.logilink.service.ReportsService;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportsController {
  private final ReportsService reports;

  public ReportsController(ReportsService reports) {
    this.reports = reports;
  }

  @GetMapping("/categories")
  public Map<String, Object> categories() {
    return reports.categories();
  }

  @GetMapping("/preview")
  public Map<String, Object> preview(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String region,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate) {
    return reports.generatePreview(category, region, startDate, endDate);
  }

  @PostMapping("/generate")
  public Map<String, Object> generate(@RequestBody(required = false) Map<String, Object> body) {
    String category = body != null && body.get("category") != null ? body.get("category").toString() : null;
    String region = body != null && body.get("region") != null ? body.get("region").toString() : null;
    String startDate = body != null && body.get("startDate") != null ? body.get("startDate").toString() : null;
    String endDate = body != null && body.get("endDate") != null ? body.get("endDate").toString() : null;
    return reports.generatePreview(category, region, startDate, endDate);
  }

  @GetMapping("/export")
  public ResponseEntity<String> exportCsv(
      @RequestParam(required = false) String category,
      @RequestParam(required = false) String region,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate) {
    String csv = reports.generateCsv(category, region, startDate, endDate);
    String filename = "logilink-" + (category != null ? category.toLowerCase().replace(" ", "-") : "report") + ".csv";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
        .body(csv);
  }

  @GetMapping("/summary")
  public Map<String, Object> summary(
      @RequestParam(required = false) String region,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate) {
    return reports.generatePreview("Fleet Report", region, startDate, endDate);
  }

  @GetMapping("/orders")
  public Map<String, Object> orders(
      @RequestParam(required = false) String region,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate) {
    return reports.generatePreview("Order Report", region, startDate, endDate);
  }

  @GetMapping("/shipments")
  public Map<String, Object> shipments(
      @RequestParam(required = false) String region,
      @RequestParam(required = false) String startDate,
      @RequestParam(required = false) String endDate) {
    return reports.generatePreview("Shipment Report", region, startDate, endDate);
  }

  @GetMapping("/fleet")
  public Map<String, Object> fleet(@RequestParam(required = false) String region) {
    return reports.buildFleetReport(region);
  }

  @GetMapping("/drivers")
  public Map<String, Object> drivers() {
    return reports.buildDriverReport();
  }

  @GetMapping("/routes")
  public Map<String, Object> routes(@RequestParam(required = false) String region) {
    return reports.buildRouteReport(region);
  }

  @GetMapping("/warehouses")
  public Map<String, Object> warehouses(@RequestParam(required = false) String region) {
    return reports.buildWarehouseReport(region);
  }

  @GetMapping("/inventory")
  public Map<String, Object> inventory(@RequestParam(required = false) String region) {
    return reports.buildInventoryReport(region);
  }
}
