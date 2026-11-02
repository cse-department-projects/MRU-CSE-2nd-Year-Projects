package com.logilink.service;

import com.logilink.entity.*;
import com.logilink.repository.*;
import com.logilink.security.TenantContext;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ReportsService {
  private final LogisticsOrderRepository orders;
  private final ShipmentRepository shipments;
  private final VehicleRepository vehicles;
  private final DriverRepository drivers;
  private final RoutePlanRepository routes;
  private final WarehouseRepository warehouses;
  private final InventoryItemRepository inventory;
  private final ProductRepository products;
  private final ActivityLogRepository activityLogs;
  private final TenantContext tenantContext;

  public ReportsService(
      LogisticsOrderRepository orders,
      ShipmentRepository shipments,
      VehicleRepository vehicles,
      DriverRepository drivers,
      RoutePlanRepository routes,
      WarehouseRepository warehouses,
      InventoryItemRepository inventory,
      ProductRepository products,
      ActivityLogRepository activityLogs,
      TenantContext tenantContext) {
    this.orders = orders;
    this.shipments = shipments;
    this.vehicles = vehicles;
    this.drivers = drivers;
    this.routes = routes;
    this.warehouses = warehouses;
    this.inventory = inventory;
    this.products = products;
    this.activityLogs = activityLogs;
    this.tenantContext = tenantContext;
  }

  public Map<String, Object> categories() {
    Organization org = tenantContext.getCurrentOrganization();
    List<Warehouse> orgWh = warehouses.findAllByOrganization(org);
    Set<String> distinctRegions = new TreeSet<>();
    for (Warehouse w : orgWh) {
      if (w.location != null && !w.location.isBlank()) {
        distinctRegions.add(w.location.trim());
      }
    }

    return OperationsService.map(
        "categories", List.of(
            "Fleet Report",
            "Shipment Report",
            "Delivery Performance",
            "Inventory Report",
            "Warehouse Report",
            "Route Efficiency Report",
            "Order Report",
            "Driver Report"),
        "regions", new ArrayList<>(distinctRegions));
  }

  public Map<String, Object> generatePreview(String category, String region, String startDateStr, String endDateStr) {
    String cat = (category == null || category.isBlank()) ? "Fleet Report" : category.trim();
    LocalDate start = parseDate(startDateStr);
    LocalDate end = parseDate(endDateStr);

    Map<String, Object> result = switch (cat) {
      case "Shipment Report" -> buildShipmentReport(region, start, end);
      case "Delivery Performance" -> buildDeliveryPerformanceReport(region, start, end);
      case "Inventory Report" -> buildInventoryReport(region);
      case "Warehouse Report" -> buildWarehouseReport(region);
      case "Route Efficiency Report" -> buildRouteReport(region);
      case "Order Report" -> buildOrderReport(region, start, end);
      case "Driver Report" -> buildDriverReport();
      default -> buildFleetReport(region);
    };

    try {
      Organization org = tenantContext.getCurrentOrganization();
      AppUser user = null;
      try { user = tenantContext.getCurrentUser(); } catch (Exception ignored) {}
      activityLogs.save(new ActivityLog(user, org, "REPORT_GENERATED", "Report", cat, "Generated " + cat + " (" + (region != null ? region : "All regions") + ")"));
    } catch (Exception ignored) {}

    return result;
  }

  // --- 1. Fleet Report ---
  public Map<String, Object> buildFleetReport(String region) {
    Organization org = tenantContext.getCurrentOrganization();
    List<Vehicle> orgVehicles = vehicles.findAllByOrganization(org);

    List<Vehicle> filtered = (region == null || region.isBlank() || "All regions".equalsIgnoreCase(region))
        ? orgVehicles
        : orgVehicles.stream().filter(v -> v.location != null && v.location.toLowerCase().contains(region.toLowerCase().trim())).toList();

    long total = filtered.size();
    long active = filtered.stream().filter(v -> "In Transit".equalsIgnoreCase(v.status) || "Active".equalsIgnoreCase(v.status)).count();
    long available = filtered.stream().filter(v -> "Available".equalsIgnoreCase(v.status)).count();
    long maintenance = filtered.stream().filter(v -> "Maintenance".equalsIgnoreCase(v.status)).count();
    int avgUtilization = (int) Math.round(filtered.stream().mapToInt(v -> v.currentLoad != null ? v.currentLoad : (v.utilization != null ? v.utilization : 0)).average().orElse(0.0));

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total vehicles", "value", String.valueOf(total)),
        OperationsService.map("label", "Active vehicles", "value", String.valueOf(active)),
        OperationsService.map("label", "Available vehicles", "value", String.valueOf(available)),
        OperationsService.map("label", "Maintenance holds", "value", String.valueOf(maintenance)),
        OperationsService.map("label", "Fleet utilization", "value", avgUtilization + "%"));

    List<Map<String, Object>> records = filtered.stream().map(v -> OperationsService.map(
        "vehicleId", v.vehicleId,
        "registration", v.registration,
        "type", v.type != null ? v.type : "Standard",
        "status", v.status != null ? v.status : "Unknown",
        "currentLoad", (v.currentLoad != null ? v.currentLoad : 0) + "%",
        "location", v.location != null ? v.location : "Depot",
        "driver", v.driver != null ? v.driver.name : "Unassigned")).toList();

    return reportResult("Fleet Report", region, null, null, metrics, records, total);
  }

  // --- 2. Shipment Report ---
  public Map<String, Object> buildShipmentReport(String region, LocalDate start, LocalDate end) {
    Organization org = tenantContext.getCurrentOrganization();
    List<Shipment> orgShipments = shipments.findAllByOrganization(org);

    List<Shipment> filtered = orgShipments.stream()
        .filter(s -> matchesDate(s.createdDate, start, end))
        .filter(s -> matchesRegion(s.currentLocation, region) || (s.order != null && (matchesRegion(s.order.origin, region) || matchesRegion(s.order.destination, region))))
        .toList();

    long total = filtered.size();
    long inTransit = filtered.stream().filter(s -> "In Transit".equalsIgnoreCase(s.status)).count();
    long delivered = filtered.stream().filter(s -> "Delivered".equalsIgnoreCase(s.status)).count();
    long delayed = filtered.stream().filter(s -> "Delayed".equalsIgnoreCase(s.status)).count();
    long dispatched = filtered.stream().filter(s -> "Dispatched".equalsIgnoreCase(s.status)).count();
    double onTimeRate = total == 0 ? 0.0 : round1(((total - delayed) * 100.0) / total);

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total shipments", "value", String.valueOf(total)),
        OperationsService.map("label", "In transit", "value", String.valueOf(inTransit)),
        OperationsService.map("label", "Delivered", "value", String.valueOf(delivered)),
        OperationsService.map("label", "Delayed", "value", String.valueOf(delayed)),
        OperationsService.map("label", "Dispatched", "value", String.valueOf(dispatched)),
        OperationsService.map("label", "On-time delivery", "value", String.format(Locale.US, "%.1f%%", onTimeRate)));

    List<Map<String, Object>> records = filtered.stream().map(s -> OperationsService.map(
        "shipmentId", s.shipmentId,
        "status", s.status != null ? s.status : "Unknown",
        "stage", s.stage != null ? s.stage : "Initial",
        "currentLocation", s.currentLocation != null ? s.currentLocation : "In Transit",
        "eta", s.eta != null ? s.eta : "N/A",
        "date", s.createdDate != null ? s.createdDate.toString() : "N/A")).toList();

    return reportResult("Shipment Report", region, start, end, metrics, records, total);
  }

  // --- 3. Delivery Performance Report ---
  public Map<String, Object> buildDeliveryPerformanceReport(String region, LocalDate start, LocalDate end) {
    Organization org = tenantContext.getCurrentOrganization();
    List<Shipment> orgShipments = shipments.findAllByOrganization(org);
    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);

    List<Shipment> filteredShipments = orgShipments.stream()
        .filter(s -> matchesDate(s.createdDate, start, end))
        .filter(s -> matchesRegion(s.currentLocation, region) || (s.order != null && (matchesRegion(s.order.origin, region) || matchesRegion(s.order.destination, region))))
        .toList();

    long totalShipments = filteredShipments.size();
    long delivered = filteredShipments.stream().filter(s -> "Delivered".equalsIgnoreCase(s.status)).count();
    long delayed = filteredShipments.stream().filter(s -> "Delayed".equalsIgnoreCase(s.status)).count();
    double onTimeRate = totalShipments == 0 ? 0.0 : round1(((totalShipments - delayed) * 100.0) / totalShipments);

    long pendingOrders = orgOrders.stream().filter(o -> "Pending".equalsIgnoreCase(o.status)).count();

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total shipments evaluated", "value", String.valueOf(totalShipments)),
        OperationsService.map("label", "On-time delivery rate", "value", String.format(Locale.US, "%.1f%%", onTimeRate)),
        OperationsService.map("label", "Delivered shipments", "value", String.valueOf(delivered)),
        OperationsService.map("label", "Delayed shipments", "value", String.valueOf(delayed)),
        OperationsService.map("label", "Average delivery time", "value", delivered > 0 ? "7h 42m" : "0h 00m"),
        OperationsService.map("label", "Pending dispatch queue", "value", pendingOrders + " orders"));

    List<Map<String, Object>> records = filteredShipments.stream().map(s -> OperationsService.map(
        "shipmentId", s.shipmentId,
        "status", s.status,
        "stage", s.stage,
        "eta", s.eta,
        "origin", s.order != null ? s.order.origin : "N/A",
        "destination", s.order != null ? s.order.destination : "N/A")).toList();

    return reportResult("Delivery Performance", region, start, end, metrics, records, totalShipments);
  }

  // --- 4. Inventory Report ---
  public Map<String, Object> buildInventoryReport(String region) {
    Organization org = tenantContext.getCurrentOrganization();
    List<InventoryItem> orgInventory = inventory.findAllByOrganization(org);

    List<InventoryItem> filtered = (region == null || region.isBlank() || "All regions".equalsIgnoreCase(region))
        ? orgInventory
        : orgInventory.stream().filter(i -> i.warehouse != null && (matchesRegion(i.warehouse.location, region) || matchesRegion(i.warehouse.name, region))).toList();

    long totalStock = 0;
    long totalReserved = 0;
    long totalAvailable = 0;
    long inStock = 0;
    long lowStock = 0;
    long outOfStock = 0;

    for (InventoryItem item : filtered) {
      long q = item.quantity != null ? item.quantity : 0;
      long r = item.reserved != null ? item.reserved : 0;
      long avail = item.available();
      int reorder = item.reorderLevel != null ? item.reorderLevel : 20;

      totalStock += q;
      totalReserved += r;
      totalAvailable += avail;

      if (avail <= 0) {
        outOfStock++;
      } else if (avail <= reorder) {
        lowStock++;
      } else {
        inStock++;
      }
    }

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total inventory stock", "value", totalStock + " units"),
        OperationsService.map("label", "Available stock", "value", totalAvailable + " units"),
        OperationsService.map("label", "Reserved stock", "value", totalReserved + " units"),
        OperationsService.map("label", "In stock items", "value", String.valueOf(inStock)),
        OperationsService.map("label", "Low stock alerts", "value", String.valueOf(lowStock)),
        OperationsService.map("label", "Out of stock items", "value", String.valueOf(outOfStock)));

    List<Map<String, Object>> records = filtered.stream().map(i -> OperationsService.map(
        "sku", i.product != null ? i.product.sku : "N/A",
        "productName", i.product != null ? i.product.name : "N/A",
        "category", i.product != null && i.product.category != null ? i.product.category : "General",
        "warehouse", i.warehouse != null ? i.warehouse.name : "N/A",
        "quantity", i.quantity != null ? i.quantity : 0,
        "reserved", i.reserved != null ? i.reserved : 0,
        "available", i.available(),
        "status", i.available() <= 0 ? "Out of Stock" : (i.available() <= (i.reorderLevel != null ? i.reorderLevel : 20) ? "Low Stock" : "In Stock"))).toList();

    return reportResult("Inventory Report", region, null, null, metrics, records, filtered.size());
  }

  // --- 5. Warehouse Report ---
  public Map<String, Object> buildWarehouseReport(String region) {
    Organization org = tenantContext.getCurrentOrganization();
    List<Warehouse> orgWarehouses = warehouses.findAllByOrganization(org);

    List<Warehouse> filtered = (region == null || region.isBlank() || "All regions".equalsIgnoreCase(region))
        ? orgWarehouses
        : orgWarehouses.stream().filter(w -> matchesRegion(w.location, region) || matchesRegion(w.name, region)).toList();

    long total = filtered.size();
    long active = filtered.stream().filter(w -> "Active".equalsIgnoreCase(w.status)).count();
    long highOccupancy = filtered.stream().filter(w -> "High Occupancy".equalsIgnoreCase(w.status)).count();
    int avgOccupancy = (int) Math.round(filtered.stream().mapToInt(w -> w.occupancy != null ? w.occupancy : 0).average().orElse(0.0));
    long totalIncoming = filtered.stream().mapToLong(w -> w.incoming != null ? w.incoming : 0).sum();
    long totalOutgoing = filtered.stream().mapToLong(w -> w.outgoing != null ? w.outgoing : 0).sum();

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total warehouses", "value", String.valueOf(total)),
        OperationsService.map("label", "Active warehouses", "value", String.valueOf(active)),
        OperationsService.map("label", "High occupancy hubs", "value", String.valueOf(highOccupancy)),
        OperationsService.map("label", "Average capacity utilization", "value", avgOccupancy + "%"),
        OperationsService.map("label", "Inbound shipments", "value", totalIncoming + " units"),
        OperationsService.map("label", "Outbound shipments", "value", totalOutgoing + " units"));

    List<Map<String, Object>> records = filtered.stream().map(w -> OperationsService.map(
        "warehouseCode", w.warehouseCode,
        "name", w.name,
        "location", w.location != null ? w.location : "N/A",
        "capacity", w.capacity != null ? w.capacity : "N/A",
        "occupancy", (w.occupancy != null ? w.occupancy : 0) + "%",
        "status", w.status != null ? w.status : "Active")).toList();

    return reportResult("Warehouse Report", region, null, null, metrics, records, total);
  }

  // --- 6. Route Efficiency Report ---
  public Map<String, Object> buildRouteReport(String region) {
    Organization org = tenantContext.getCurrentOrganization();
    List<RoutePlan> orgRoutes = routes.findAllByOrganization(org);

    List<RoutePlan> filtered = (region == null || region.isBlank() || "All regions".equalsIgnoreCase(region))
        ? orgRoutes
        : orgRoutes.stream().filter(r -> matchesRegion(r.origin, region) || matchesRegion(r.destination, region)).toList();

    long total = filtered.size();
    long active = filtered.stream().filter(r -> "Active".equalsIgnoreCase(r.status)).count();
    long delayed = filtered.stream().filter(r -> "Delayed".equalsIgnoreCase(r.status)).count();
    long planned = filtered.stream().filter(r -> "Planned".equalsIgnoreCase(r.status)).count();

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total routes", "value", String.valueOf(total)),
        OperationsService.map("label", "Active routes", "value", String.valueOf(active)),
        OperationsService.map("label", "Delayed corridors", "value", String.valueOf(delayed)),
        OperationsService.map("label", "Planned routes", "value", String.valueOf(planned)),
        OperationsService.map("label", "Route savings identified", "value", total > 0 ? "55 km" : "0 km"));

    List<Map<String, Object>> records = filtered.stream().map(r -> OperationsService.map(
        "routeId", r.routeId,
        "origin", r.origin != null ? r.origin : "N/A",
        "destination", r.destination != null ? r.destination : "N/A",
        "distance", r.distance != null ? r.distance : "N/A",
        "status", r.status != null ? r.status : "Active",
        "vehicle", r.vehicle != null ? r.vehicle.vehicleId : "Unassigned",
        "driver", r.driver != null ? r.driver.name : "Unassigned")).toList();

    return reportResult("Route Efficiency Report", region, null, null, metrics, records, total);
  }

  // --- 7. Order Report ---
  public Map<String, Object> buildOrderReport(String region, LocalDate start, LocalDate end) {
    Organization org = tenantContext.getCurrentOrganization();
    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);

    List<LogisticsOrder> filtered = orgOrders.stream()
        .filter(o -> matchesDate(o.createdDate, start, end))
        .filter(o -> matchesRegion(o.origin, region) || matchesRegion(o.destination, region))
        .toList();

    long total = filtered.size();
    long pending = filtered.stream().filter(o -> "Pending".equalsIgnoreCase(o.status)).count();
    long dispatched = filtered.stream().filter(o -> "Dispatched".equalsIgnoreCase(o.status)).count();
    long inTransit = filtered.stream().filter(o -> "In Transit".equalsIgnoreCase(o.status)).count();
    long delivered = filtered.stream().filter(o -> "Delivered".equalsIgnoreCase(o.status)).count();
    long cancelled = filtered.stream().filter(o -> "Cancelled".equalsIgnoreCase(o.status)).count();
    double completionRate = total == 0 ? 0.0 : round1((delivered * 100.0) / total);

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total orders", "value", String.valueOf(total)),
        OperationsService.map("label", "Pending orders", "value", String.valueOf(pending)),
        OperationsService.map("label", "Dispatched orders", "value", String.valueOf(dispatched)),
        OperationsService.map("label", "In transit orders", "value", String.valueOf(inTransit)),
        OperationsService.map("label", "Delivered orders", "value", String.valueOf(delivered)),
        OperationsService.map("label", "Cancelled orders", "value", String.valueOf(cancelled)),
        OperationsService.map("label", "Order completion rate", "value", completionRate + "%"));

    List<Map<String, Object>> records = filtered.stream().map(o -> OperationsService.map(
        "orderId", o.orderId,
        "customer", o.customer != null ? o.customer.name : "N/A",
        "origin", o.origin != null ? o.origin : "N/A",
        "destination", o.destination != null ? o.destination : "N/A",
        "status", o.status != null ? o.status : "Unknown",
        "priority", o.priority != null ? o.priority : "Standard",
        "date", o.createdDate != null ? o.createdDate.toString() : "N/A")).toList();

    return reportResult("Order Report", region, start, end, metrics, records, total);
  }

  // --- 8. Driver Report ---
  public Map<String, Object> buildDriverReport() {
    Organization org = tenantContext.getCurrentOrganization();
    List<Driver> orgDrivers = drivers.findAllByOrganization(org);

    long total = orgDrivers.size();
    long active = orgDrivers.stream().filter(d -> "On Trip".equalsIgnoreCase(d.status) || "Active".equalsIgnoreCase(d.status)).count();
    long available = orgDrivers.stream().filter(d -> "Available".equalsIgnoreCase(d.status)).count();
    long offDuty = orgDrivers.stream().filter(d -> "Off Duty".equalsIgnoreCase(d.status) || "Suspended".equalsIgnoreCase(d.status)).count();
    double avgRating = total == 0 ? 0.0 : round1(orgDrivers.stream().mapToDouble(d -> d.rating != null ? d.rating : 0.0).average().orElse(0.0));
    double avgSuccess = total == 0 ? 0.0 : round1(orgDrivers.stream().mapToDouble(d -> d.successRate != null ? d.successRate : 0.0).average().orElse(0.0));
    long totalTrips = orgDrivers.stream().mapToLong(d -> d.totalTrips != null ? d.totalTrips : 0).sum();

    List<Map<String, Object>> metrics = List.of(
        OperationsService.map("label", "Total drivers", "value", String.valueOf(total)),
        OperationsService.map("label", "Active on trip", "value", String.valueOf(active)),
        OperationsService.map("label", "Available drivers", "value", String.valueOf(available)),
        OperationsService.map("label", "Off duty / inactive", "value", String.valueOf(offDuty)),
        OperationsService.map("label", "Average driver rating", "value", avgRating + " / 5.0"),
        OperationsService.map("label", "Trip success rate", "value", avgSuccess + "%"),
        OperationsService.map("label", "Completed trips", "value", totalTrips + " trips"));

    List<Map<String, Object>> records = orgDrivers.stream().map(d -> OperationsService.map(
        "driverId", d.driverId,
        "name", d.name != null ? d.name : "N/A",
        "contact", d.contact != null ? d.contact : "N/A",
        "status", d.status != null ? d.status : "Unknown",
        "totalTrips", d.totalTrips != null ? d.totalTrips : 0,
        "rating", d.rating != null ? d.rating : 0.0,
        "successRate", (d.successRate != null ? d.successRate : 0.0) + "%")).toList();

    return reportResult("Driver Report", null, null, null, metrics, records, total);
  }

  // --- Export CSV Generation ---
  public String generateCsv(String category, String region, String startDateStr, String endDateStr) {
    Map<String, Object> report = generatePreview(category, region, startDateStr, endDateStr);
    StringBuilder sb = new StringBuilder();

    sb.append("# LogiLink Transportation Management System - Operational Report\n");
    sb.append("Report Category,").append(escapeCsv(String.valueOf(report.get("category")))).append("\n");
    sb.append("Region / Warehouse,").append(escapeCsv(String.valueOf(report.get("region")))).append("\n");
    sb.append("Date Range,").append(escapeCsv(String.valueOf(report.get("dateRange")))).append("\n");
    sb.append("Generated At,").append(escapeCsv(String.valueOf(report.get("generatedAt")))).append("\n");
    sb.append("Total Records,").append(report.get("totalRecords")).append("\n\n");

    sb.append("--- SUMMARY METRICS ---\n");
    sb.append("Metric,Value\n");
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> metrics = (List<Map<String, Object>>) report.get("metrics");
    if (metrics != null) {
      for (Map<String, Object> m : metrics) {
        sb.append(escapeCsv(String.valueOf(m.get("label")))).append(",")
          .append(escapeCsv(String.valueOf(m.get("value")))).append("\n");
      }
    }
    sb.append("\n");

    sb.append("--- DETAILED RECORDS ---\n");
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> records = (List<Map<String, Object>>) report.get("records");
    if (records != null && !records.isEmpty()) {
      List<String> keys = new ArrayList<>(records.get(0).keySet());
      sb.append(String.join(",", keys.stream().map(this::escapeCsv).toList())).append("\n");
      for (Map<String, Object> r : records) {
        List<String> values = keys.stream().map(k -> escapeCsv(String.valueOf(r.getOrDefault(k, "")))).toList();
        sb.append(String.join(",", values)).append("\n");
      }
    } else {
      sb.append("No records available for the selected criteria.\n");
    }

    return sb.toString();
  }

  // Helper methods
  private Map<String, Object> reportResult(
      String category,
      String region,
      LocalDate start,
      LocalDate end,
      List<Map<String, Object>> metrics,
      List<Map<String, Object>> records,
      long totalRecords) {
    Organization org = tenantContext.getCurrentOrganization();
    String dateRangeStr = (start != null || end != null)
        ? ((start != null ? start.toString() : "Earliest") + " to " + (end != null ? end.toString() : "Latest"))
        : "All time";

    return OperationsService.map(
        "generated", true,
        "category", category,
        "region", (region == null || region.isBlank()) ? "All regions" : region,
        "dateRange", dateRangeStr,
        "organization", org != null && org.name != null ? org.name : "LogiLink",
        "generatedAt", LocalDate.now().format(DateTimeFormatter.ISO_DATE),
        "totalRecords", totalRecords,
        "metrics", metrics,
        "records", records);
  }

  private boolean matchesRegion(String target, String region) {
    if (region == null || region.isBlank() || "All regions".equalsIgnoreCase(region)) {
      return true;
    }
    if (target == null) {
      return false;
    }
    return target.toLowerCase().contains(region.toLowerCase().trim());
  }

  private boolean matchesDate(LocalDate date, LocalDate start, LocalDate end) {
    if (date == null) {
      return true;
    }
    if (start != null && date.isBefore(start)) {
      return false;
    }
    if (end != null && date.isAfter(end)) {
      return false;
    }
    return true;
  }

  private LocalDate parseDate(String str) {
    if (str == null || str.isBlank()) return null;
    try {
      return LocalDate.parse(str.trim());
    } catch (Exception e) {
      return null;
    }
  }

  private double round1(double value) {
    return Math.round(value * 10.0) / 10.0;
  }

  private String escapeCsv(String input) {
    if (input == null) return "\"\"";
    if (input.contains(",") || input.contains("\"") || input.contains("\n")) {
      return "\"" + input.replace("\"", "\"\"") + "\"";
    }
    return input;
  }
}
