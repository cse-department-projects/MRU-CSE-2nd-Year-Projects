package com.logilink.controller;

import com.logilink.service.OperationsService;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class OperationsController {
  private final OperationsService operations;

  public OperationsController(OperationsService operations) {
    this.operations = operations;
  }

  @GetMapping("/orders")
  public List<Map<String, Object>> orders() {
    return operations.orders();
  }

  @PostMapping("/orders")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createOrder(@RequestBody Map<String, Object> body) {
    return operations.createOrder(body);
  }

  @GetMapping("/orders/{id}")
  public Map<String, Object> order(@PathVariable String id) {
    return operations.order(id);
  }

  @PutMapping("/orders/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateOrder(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateOrder(id, body);
  }

  @PatchMapping("/orders/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateOrderStatus(id, body);
  }

  @GetMapping("/shipments")
  public List<Map<String, Object>> shipments() {
    return operations.shipments();
  }

  @GetMapping("/shipments/stages")
  public List<String> shipmentStages() {
    return OperationsService.SHIPMENT_STAGES;
  }

  @GetMapping("/shipments/{id}")
  public Map<String, Object> shipment(@PathVariable String id) {
    return operations.shipment(id);
  }

  @PostMapping("/shipments")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createShipment(@RequestBody Map<String, Object> body) {
    return operations.createShipment(body);
  }

  @PutMapping("/shipments/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateShipment(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateShipment(id, body);
  }

  @PatchMapping("/shipments/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateShipmentStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateShipmentStatus(id, body);
  }

  @DeleteMapping("/shipments/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteShipment(@PathVariable String id) {
    return operations.deleteShipment(id);
  }

  @GetMapping("/vehicles")
  public List<Map<String, Object>> vehicles() {
    return operations.vehicles();
  }

  @GetMapping("/vehicles/{id}")
  public Map<String, Object> vehicle(@PathVariable String id) {
    return operations.vehicle(id);
  }

  @PostMapping("/vehicles")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createVehicle(@RequestBody Map<String, Object> body) {
    return operations.createVehicle(body);
  }

  @PutMapping("/vehicles/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateVehicle(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateVehicle(id, body);
  }

  @PatchMapping("/vehicles/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateVehicleStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateVehicleStatus(id, body);
  }

  @DeleteMapping("/vehicles/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteVehicle(@PathVariable String id) {
    return operations.deleteVehicle(id);
  }

  @GetMapping("/drivers")
  public List<Map<String, Object>> drivers() {
    return operations.drivers();
  }

  @GetMapping("/drivers/{id}")
  public Map<String, Object> driver(@PathVariable String id) {
    return operations.driver(id);
  }

  @PostMapping("/drivers")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createDriver(@RequestBody Map<String, Object> body) {
    return operations.createDriver(body);
  }

  @PutMapping("/drivers/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateDriver(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateDriver(id, body);
  }

  @PatchMapping("/drivers/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateDriverStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateDriverStatus(id, body);
  }

  @DeleteMapping("/drivers/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteDriver(@PathVariable String id) {
    return operations.deleteDriver(id);
  }

  @GetMapping("/routes")
  public List<Map<String, Object>> routes() {
    return operations.routes();
  }

  @GetMapping("/routes/{id}")
  public Map<String, Object> route(@PathVariable String id) {
    return operations.route(id);
  }

  @PostMapping("/routes")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createRoute(@RequestBody Map<String, Object> body) {
    return operations.createRoute(body);
  }

  @PutMapping("/routes/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateRoute(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateRoute(id, body);
  }

  @PatchMapping("/routes/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateRouteStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateRouteStatus(id, body);
  }

  @DeleteMapping("/routes/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteRoute(@PathVariable String id) {
    return operations.deleteRoute(id);
  }

  @PostMapping("/routes/optimize")
  public Map<String, Object> optimizeRoute(@RequestBody(required = false) Map<String, Object> body) {
    return operations.optimizeRoute(body);
  }

  @GetMapping("/warehouses")
  public List<Map<String, Object>> warehouses() {
    return operations.warehouses();
  }

  @GetMapping("/warehouses/{id}")
  public Map<String, Object> warehouse(@PathVariable String id) {
    return operations.warehouse(id);
  }

  @PostMapping("/warehouses")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createWarehouse(@RequestBody Map<String, Object> body) {
    return operations.createWarehouse(body);
  }

  @PutMapping("/warehouses/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateWarehouse(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateWarehouse(id, body);
  }

  @PatchMapping("/warehouses/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateWarehouseStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateWarehouseStatus(id, body);
  }

  @DeleteMapping("/warehouses/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteWarehouse(@PathVariable String id) {
    return operations.deleteWarehouse(id);
  }

  // --- Products ---
  @GetMapping("/products")
  public List<Map<String, Object>> products() {
    return operations.products();
  }

  @GetMapping("/products/{id}")
  public Map<String, Object> product(@PathVariable String id) {
    return operations.product(id);
  }

  @PostMapping("/products")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> createProduct(@RequestBody Map<String, Object> body) {
    return operations.createProduct(body);
  }

  @PutMapping("/products/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateProduct(id, body);
  }

  @PatchMapping("/products/{id}/status")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateProductStatus(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateProductStatus(id, body);
  }

  @DeleteMapping("/products/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteProduct(@PathVariable String id) {
    return operations.deleteProduct(id);
  }

  // --- Inventory ---
  @GetMapping("/inventory")
  public List<Map<String, Object>> inventory() {
    return operations.inventory();
  }

  @GetMapping("/inventory/{id}")
  public Map<String, Object> inventoryItem(@PathVariable String id) {
    return operations.inventoryItem(id);
  }

  @PostMapping("/inventory")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> createInventory(@RequestBody Map<String, Object> body) {
    return operations.createInventory(body);
  }

  @PutMapping("/inventory/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> updateInventory(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.updateInventory(id, body);
  }

  @PatchMapping("/inventory/{id}/adjust")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> adjustInventory(@PathVariable String id, @RequestBody Map<String, Object> body) {
    return operations.adjustInventory(id, body);
  }

  @DeleteMapping("/inventory/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteInventory(@PathVariable String id) {
    return operations.deleteInventory(id);
  }

  @GetMapping("/tracking")
  public List<Map<String, Object>> tracking() {
    return operations.tracking();
  }

  @GetMapping("/tracking/events")
  public List<Map<String, Object>> trackingEvents() {
    return operations.trackingEvents();
  }

  @GetMapping("/tracking/events/{id}")
  public Map<String, Object> trackingEvent(@PathVariable Long id) {
    return operations.trackingEvent(id);
  }

  @DeleteMapping("/tracking/events/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  public Map<String, Object> deleteTrackingEvent(@PathVariable Long id) {
    return operations.deleteTrackingEvent(id);
  }

  @GetMapping("/tracking/{shipmentId}")
  public List<Map<String, Object>> trackingForShipment(@PathVariable String shipmentId) {
    return operations.trackingForShipment(shipmentId);
  }

  @GetMapping("/tracking/vehicle/{vehicleId}")
  public List<Map<String, Object>> trackingForVehicle(@PathVariable String vehicleId) {
    return operations.trackingForVehicle(vehicleId);
  }

  @PostMapping("/tracking")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','OPERATOR')")
  public Map<String, Object> createTrackingEvent(@RequestBody Map<String, Object> body) {
    return operations.createTrackingEvent(body);
  }
}
