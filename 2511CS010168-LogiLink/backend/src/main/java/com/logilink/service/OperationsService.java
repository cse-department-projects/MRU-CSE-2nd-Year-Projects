package com.logilink.service;

import com.logilink.entity.*;
import com.logilink.exception.ConflictException;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.*;
import com.logilink.security.TenantContext;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OperationsService {
  public static final List<String> SHIPMENT_STAGES = List.of("Order Created", "Confirmed", "Dispatched", "Picked Up", "In Transit", "Out for Delivery", "Delivered");

  private final LogisticsOrderRepository orders;
  private final CustomerRepository customers;
  private final VehicleRepository vehicles;
  private final DriverRepository drivers;
  private final ShipmentRepository shipments;
  private final RoutePlanRepository routes;
  private final WarehouseRepository warehouses;
  private final ProductRepository products;
  private final InventoryItemRepository inventory;
  private final NotificationRepository notifications;
  private final TrackingEventRepository trackingEvents;
  private final ActivityLogRepository activityLogs;
  private final TenantContext tenantContext;

  public OperationsService(
      LogisticsOrderRepository orders,
      CustomerRepository customers,
      VehicleRepository vehicles,
      DriverRepository drivers,
      ShipmentRepository shipments,
      RoutePlanRepository routes,
      WarehouseRepository warehouses,
      ProductRepository products,
      InventoryItemRepository inventory,
      NotificationRepository notifications,
      TrackingEventRepository trackingEvents,
      ActivityLogRepository activityLogs,
      TenantContext tenantContext) {
    this.orders = orders;
    this.customers = customers;
    this.vehicles = vehicles;
    this.drivers = drivers;
    this.shipments = shipments;
    this.routes = routes;
    this.warehouses = warehouses;
    this.products = products;
    this.inventory = inventory;
    this.notifications = notifications;
    this.trackingEvents = trackingEvents;
    this.activityLogs = activityLogs;
    this.tenantContext = tenantContext;
  }

  public List<Map<String, Object>> orders() {
    Organization org = tenantContext.getCurrentOrganization();
    return orders.findAllByOrganization(org).stream().map(this::orderDto).toList();
  }

  public Map<String, Object> order(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return orderDto(findOrder(id, org));
  }

  @Transactional
  public Map<String, Object> createOrder(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();
    LogisticsOrder order = new LogisticsOrder();
    order.organization = org;
    order.owner = user;
    String customOrderId = string(body.get("orderId")).trim();
    if (!customOrderId.isBlank() && orders.findByOrderId(customOrderId).isEmpty()) {
      order.orderId = customOrderId;
    } else {
      order.orderId = nextOrderCode();
    }
    applyOrder(order, body, org, user);
    LogisticsOrder saved = orders.save(order);
    logActivity("CREATE", "Order", saved.orderId, "Created order " + saved.orderId + " (" + saved.status + ")");
    notifyOperationalEvent("New Order Placed", "Order " + saved.orderId + " has been received.", "Order", "Medium");
    return orderDto(saved);
  }

  @Transactional
  public Map<String, Object> updateOrder(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();
    LogisticsOrder order = findOrder(id, org);
    applyOrder(order, body, org, user);
    LogisticsOrder saved = orders.save(order);
    logActivity("UPDATE", "Order", saved.orderId, "Updated order " + saved.orderId);
    return orderDto(saved);
  }

  @Transactional
  public Map<String, Object> updateOrderStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    LogisticsOrder order = findOrder(id, org);
    order.status = string(body.getOrDefault("status", order.status));
    LogisticsOrder saved = orders.save(order);
    logActivity("STATUS_CHANGE", "Order", saved.orderId, "Order status changed to " + saved.status);
    return orderDto(saved);
  }

  public List<Map<String, Object>> shipments() {
    Organization org = tenantContext.getCurrentOrganization();
    return shipments.findAllByOrganization(org).stream().map(this::shipmentDto).toList();
  }

  public Map<String, Object> shipment(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return shipmentDto(findShipment(id, org));
  }

  @Transactional
  public Map<String, Object> createShipment(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();

    String orderIdVal = string(body.getOrDefault("orderId", body.get("order"))).trim();
    if (orderIdVal.isBlank()) {
      throw new IllegalArgumentException("An order is required to create a shipment.");
    }
    LogisticsOrder order = findOrder(orderIdVal, org);

    Optional<Shipment> existing = shipments.findByOrderAndOrganization(order, org);
    if (existing.isPresent()) {
      throw new IllegalArgumentException("A shipment already exists for order " + order.orderId + " (" + existing.get().shipmentId + ")");
    }

    Shipment shipment = new Shipment();
    shipment.organization = org;
    shipment.owner = user;
    shipment.order = order;
    shipment.createdDate = LocalDate.now();

    String customShipmentId = string(body.get("shipmentId")).trim();
    if (!customShipmentId.isBlank() && shipments.findByShipmentId(customShipmentId).isEmpty()) {
      shipment.shipmentId = customShipmentId;
    } else {
      shipment.shipmentId = nextShipmentCode();
    }

    if (body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vehicleVal = string(body.getOrDefault("vehicleId", body.get("vehicle"))).trim();
      if (!vehicleVal.isBlank() && !"Unassigned".equalsIgnoreCase(vehicleVal)) {
        shipment.vehicle = vehicles.findByVehicleIdAndOrganization(vehicleVal, org).orElse(null);
      }
    } else if (order.vehicle != null) {
      shipment.vehicle = order.vehicle;
    }

    if (body.containsKey("driver") || body.containsKey("driverId")) {
      String driverVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (!driverVal.isBlank() && !"Unassigned".equalsIgnoreCase(driverVal)) {
        shipment.driver = drivers.findByDriverIdAndOrganization(driverVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> d.name.equalsIgnoreCase(driverVal) || d.driverId.equalsIgnoreCase(driverVal)).findFirst()
        ).orElse(null);
      }
    } else if (order.driver != null) {
      shipment.driver = order.driver;
    }

    if (body.containsKey("route") || body.containsKey("routeId")) {
      String routeVal = string(body.getOrDefault("routeId", body.get("route"))).trim();
      if (!routeVal.isBlank() && !"Unassigned".equalsIgnoreCase(routeVal)) {
        shipment.route = routes.findByRouteIdAndOrganization(routeVal, org).orElse(null);
      }
    } else if (order.route != null) {
      shipment.route = order.route;
    }

    String loc = string(body.getOrDefault("currentLocation", body.get("location"))).trim();
    if (loc.isBlank()) {
      loc = (order.origin != null && !order.origin.isBlank()) ? (order.origin + " Terminal") : "Origin Terminal";
    }
    shipment.currentLocation = loc;

    String status = string(body.getOrDefault("status", "Dispatched")).trim();
    if (status.isBlank()) status = "Dispatched";
    shipment.status = status;

    String stage = string(body.get("stage")).trim();
    if (stage.isBlank()) {
      stage = switch (status) {
        case "Delivered" -> "Delivered";
        case "In Transit" -> "In Transit";
        case "Delayed" -> "Picked Up";
        case "Pending" -> "Order Created";
        case "Confirmed" -> "Confirmed";
        default -> "Dispatched";
      };
    }
    shipment.stage = stage;

    String eta = string(body.get("eta")).trim();
    if (eta.isBlank()) {
      eta = (order.eta != null && !order.eta.isBlank()) ? order.eta : "Scheduled";
    }
    shipment.eta = eta;

    order.status = shipment.status;
    orders.save(order);

    Shipment saved = shipments.save(shipment);
    logActivity("CREATE", "Shipment", saved.shipmentId, "Created shipment " + saved.shipmentId + " for order " + order.orderId);
    notifyOperationalEvent("Shipment Created", "Shipment " + saved.shipmentId + " has been registered.", "Shipment", "Medium");

    if (saved.vehicle != null) {
      TrackingEvent event = new TrackingEvent();
      event.organization = org;
      event.shipment = saved;
      event.vehicle = saved.vehicle;
      event.status = saved.status;
      event.eta = saved.eta;
      event.speed = "In Transit".equalsIgnoreCase(saved.status) ? "52 km/h" : "0 km/h";
      event.mapX = 35;
      event.mapY = 40;
      event.destinationX = 65;
      event.destinationY = 55;
      event.routeAngle = 20;
      event.routeLength = 150;
      event.timestamp = java.time.Instant.now();
      trackingEvents.save(event);
    }

    return shipmentDto(saved);
  }

  @Transactional
  public Map<String, Object> updateShipment(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Shipment shipment = findShipment(id, org);

    if (body.containsKey("orderId") || body.containsKey("order")) {
      String orderVal = string(body.getOrDefault("orderId", body.get("order"))).trim();
      if (!orderVal.isBlank()) {
        LogisticsOrder newOrder = findOrder(orderVal, org);
        if (shipment.order == null || !Objects.equals(shipment.order.id, newOrder.id)) {
          Optional<Shipment> existing = shipments.findByOrderAndOrganization(newOrder, org);
          if (existing.isPresent() && !Objects.equals(existing.get().id, shipment.id)) {
            throw new IllegalArgumentException("Order " + newOrder.orderId + " is already assigned to shipment " + existing.get().shipmentId);
          }
          shipment.order = newOrder;
        }
      }
    }

    if (body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vehicleVal = string(body.getOrDefault("vehicleId", body.get("vehicle"))).trim();
      if (vehicleVal.isBlank() || "Unassigned".equalsIgnoreCase(vehicleVal)) {
        shipment.vehicle = null;
      } else {
        shipment.vehicle = vehicles.findByVehicleIdAndOrganization(vehicleVal, org).orElse(shipment.vehicle);
      }
    }

    if (body.containsKey("driver") || body.containsKey("driverId")) {
      String driverVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (driverVal.isBlank() || "Unassigned".equalsIgnoreCase(driverVal)) {
        shipment.driver = null;
      } else {
        shipment.driver = drivers.findByDriverIdAndOrganization(driverVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> d.name.equalsIgnoreCase(driverVal) || d.driverId.equalsIgnoreCase(driverVal)).findFirst()
        ).orElse(shipment.driver);
      }
    }

    if (body.containsKey("route") || body.containsKey("routeId")) {
      String routeVal = string(body.getOrDefault("routeId", body.get("route"))).trim();
      if (routeVal.isBlank() || "Unassigned".equalsIgnoreCase(routeVal)) {
        shipment.route = null;
      } else {
        shipment.route = routes.findByRouteIdAndOrganization(routeVal, org).orElse(shipment.route);
      }
    }

    if (body.containsKey("currentLocation") || body.containsKey("location")) {
      shipment.currentLocation = string(body.getOrDefault("currentLocation", body.get("location")));
    }
    if (body.containsKey("eta")) {
      shipment.eta = string(body.get("eta"));
    }
    if (body.containsKey("status")) {
      shipment.status = string(body.get("status"));
      if (shipment.order != null) {
        shipment.order.status = shipment.status;
        orders.save(shipment.order);
      }
    }
    if (body.containsKey("stage")) {
      shipment.stage = string(body.get("stage"));
    }

    Shipment saved = shipments.save(shipment);
    logActivity("UPDATE", "Shipment", saved.shipmentId, "Updated shipment " + saved.shipmentId);
    return shipmentDto(saved);
  }

  @Transactional
  public Map<String, Object> updateShipmentStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Shipment shipment = findShipment(id, org);
    if (body.containsKey("status")) {
      shipment.status = string(body.get("status"));
      if (shipment.order != null) {
        shipment.order.status = shipment.status;
        orders.save(shipment.order);
      }
    }
    if (body.containsKey("stage")) {
      shipment.stage = string(body.get("stage"));
    } else if (body.containsKey("status")) {
      String st = shipment.status;
      if ("Delivered".equalsIgnoreCase(st)) shipment.stage = "Delivered";
      else if ("In Transit".equalsIgnoreCase(st)) shipment.stage = "In Transit";
      else if ("Delayed".equalsIgnoreCase(st)) shipment.stage = "Picked Up";
      else if ("Dispatched".equalsIgnoreCase(st)) shipment.stage = "Dispatched";
      else if ("Confirmed".equalsIgnoreCase(st)) shipment.stage = "Confirmed";
      else if ("Pending".equalsIgnoreCase(st)) shipment.stage = "Order Created";
    }
    if (body.containsKey("currentLocation") || body.containsKey("location")) {
      shipment.currentLocation = string(body.getOrDefault("currentLocation", body.get("location")));
    }
    Shipment saved = shipments.save(shipment);
    logActivity("STATUS_CHANGE", "Shipment", saved.shipmentId, "Shipment " + saved.shipmentId + " status updated to " + saved.status);
    if ("Delivered".equalsIgnoreCase(saved.status)) {
      notifyOperationalEvent("Shipment Delivered", "Shipment " + saved.shipmentId + " has been successfully delivered.", "Shipment", "Low");
    } else if ("Delayed".equalsIgnoreCase(saved.status)) {
      notifyOperationalEvent("Shipment Delayed", "Shipment " + saved.shipmentId + " has encountered an operational delay.", "Shipment", "High");
    }
    return shipmentDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteShipment(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Shipment shipment = findShipment(id, org);
    List<TrackingEvent> events = trackingEvents.findByShipmentAndOrganizationOrderByTimestampDesc(shipment, org);
    for (TrackingEvent e : events) {
      e.shipment = null;
      trackingEvents.save(e);
    }
    shipments.delete(shipment);
    logActivity("DELETE", "Shipment", shipment.shipmentId, "Deleted shipment " + shipment.shipmentId);
    return map("deleted", true, "id", id, "message", "Shipment " + shipment.shipmentId + " deleted successfully.");
  }

  public List<Map<String, Object>> vehicles() {
    Organization org = tenantContext.getCurrentOrganization();
    return vehicles.findAllByOrganization(org).stream().map(this::vehicleDto).toList();
  }

  public Map<String, Object> vehicle(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return vehicleDto(findVehicle(id, org));
  }

  @Transactional
  public Map<String, Object> createVehicle(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();
    Vehicle v = new Vehicle();
    v.organization = org;
    v.owner = user;

    String customId = string(body.getOrDefault("vehicleId", body.get("id"))).trim();
    if (!customId.isBlank() && vehicles.findByVehicleId(customId).isEmpty()) {
      v.vehicleId = customId;
    } else {
      v.vehicleId = nextVehicleCode();
    }
    v.registration = string(body.getOrDefault("registration", "REG-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())).trim();
    v.type = string(body.getOrDefault("type", "Container Truck")).trim();
    v.capacity = string(body.getOrDefault("capacity", "18 t")).trim();
    v.capacityValue = parseDouble(body.get("capacityValue"), 18.0);
    v.currentLoad = parseInt(body.get("currentLoad"), 0);
    v.status = string(body.getOrDefault("status", "Available")).trim();
    v.location = string(body.getOrDefault("location", "Hub")).trim();
    v.lastUpdated = "Just now";
    v.maintenance = string(body.getOrDefault("maintenance", "Clear")).trim();
    v.route = string(body.getOrDefault("route", "Unassigned")).trim();
    v.utilization = parseInt(body.get("utilization"), 0);

    if (body.containsKey("driverId") || body.containsKey("driver")) {
      String driverVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (!driverVal.isBlank() && !"Unassigned".equalsIgnoreCase(driverVal)) {
        v.driver = drivers.findByDriverIdAndOrganization(driverVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> d.name.equalsIgnoreCase(driverVal) || d.driverId.equalsIgnoreCase(driverVal)).findFirst()
        ).orElse(null);
      }
    }
    Vehicle saved = vehicles.save(v);
    logActivity("CREATE", "Vehicle", saved.vehicleId, "Registered vehicle " + saved.vehicleId + " (" + saved.registration + ")");
    return vehicleDto(saved);
  }

  @Transactional
  public Map<String, Object> updateVehicle(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Vehicle v = findVehicle(id, org);

    if (body.containsKey("registration")) {
      String reg = string(body.get("registration")).trim();
      if (!reg.isBlank()) v.registration = reg;
    }
    if (body.containsKey("type")) {
      v.type = string(body.get("type")).trim();
    }
    if (body.containsKey("capacity")) {
      v.capacity = string(body.get("capacity")).trim();
    }
    if (body.containsKey("capacityValue")) {
      v.capacityValue = parseDouble(body.get("capacityValue"), v.capacityValue);
    }
    if (body.containsKey("currentLoad")) {
      v.currentLoad = parseInt(body.get("currentLoad"), v.currentLoad);
    }
    if (body.containsKey("status")) {
      v.status = string(body.get("status")).trim();
    }
    if (body.containsKey("location")) {
      v.location = string(body.get("location")).trim();
    }
    if (body.containsKey("maintenance")) {
      v.maintenance = string(body.get("maintenance")).trim();
    }
    if (body.containsKey("route")) {
      v.route = string(body.get("route")).trim();
    }
    if (body.containsKey("utilization")) {
      v.utilization = parseInt(body.get("utilization"), v.utilization);
    }
    v.lastUpdated = "Just now";

    if (body.containsKey("driverId") || body.containsKey("driver")) {
      String driverVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (driverVal.isBlank() || "Unassigned".equalsIgnoreCase(driverVal)) {
        v.driver = null;
      } else {
        v.driver = drivers.findByDriverIdAndOrganization(driverVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> d.name.equalsIgnoreCase(driverVal) || d.driverId.equalsIgnoreCase(driverVal)).findFirst()
        ).orElse(v.driver);
      }
    }

    Vehicle saved = vehicles.save(v);
    logActivity("UPDATE", "Vehicle", saved.vehicleId, "Updated vehicle " + saved.vehicleId);
    return vehicleDto(saved);
  }

  @Transactional
  public Map<String, Object> updateVehicleStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Vehicle v = findVehicle(id, org);
    if (body.containsKey("status")) {
      v.status = string(body.get("status")).trim();
    }
    if (body.containsKey("location")) {
      v.location = string(body.get("location")).trim();
    }
    if (body.containsKey("currentLoad")) {
      v.currentLoad = parseInt(body.get("currentLoad"), v.currentLoad);
    }
    if (body.containsKey("maintenance")) {
      v.maintenance = string(body.get("maintenance")).trim();
    }
    v.lastUpdated = "Just now";
    Vehicle saved = vehicles.save(v);
    logActivity("STATUS_CHANGE", "Vehicle", saved.vehicleId, "Vehicle " + saved.vehicleId + " status updated to " + saved.status);
    if ("Maintenance".equalsIgnoreCase(saved.status)) {
      notifyOperationalEvent("Vehicle In Maintenance", "Vehicle " + saved.vehicleId + " status set to Maintenance.", "Fleet", "Medium");
    }
    return vehicleDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteVehicle(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Vehicle v = findVehicle(id, org);

    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);
    for (LogisticsOrder o : orgOrders) {
      if (o.vehicle != null && Objects.equals(o.vehicle.id, v.id)) {
        o.vehicle = null;
        orders.save(o);
      }
    }

    List<Shipment> orgShipments = shipments.findAllByOrganization(org);
    for (Shipment s : orgShipments) {
      if (s.vehicle != null && Objects.equals(s.vehicle.id, v.id)) {
        s.vehicle = null;
        shipments.save(s);
      }
    }

    List<TrackingEvent> events = trackingEvents.findAllByOrganization(org);
    for (TrackingEvent te : events) {
      if (te.vehicle != null && Objects.equals(te.vehicle.id, v.id)) {
        te.vehicle = null;
        trackingEvents.save(te);
      }
    }

    vehicles.delete(v);
    return map("deleted", true, "id", id, "message", "Vehicle " + v.vehicleId + " deleted successfully.");
  }

  public List<Map<String, Object>> drivers() {
    Organization org = tenantContext.getCurrentOrganization();
    return drivers.findAllByOrganization(org).stream().map(this::driverDto).toList();
  }

  public Map<String, Object> driver(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return driverDto(findDriver(id, org));
  }

  @Transactional
  public Map<String, Object> createDriver(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();
    Driver d = new Driver();
    d.organization = org;
    d.owner = user;
    String customId = string(body.getOrDefault("driverId", body.get("id"))).trim();
    if (!customId.isBlank() && drivers.findByDriverId(customId).isEmpty()) {
      d.driverId = customId;
    } else {
      d.driverId = nextDriverCode();
    }
    d.name = string(body.getOrDefault("name", "New Driver")).trim();
    d.contact = string(body.getOrDefault("contact", body.getOrDefault("phone", "+91 90000 00000"))).trim();
    d.status = string(body.getOrDefault("status", "Available")).trim();
    d.totalTrips = parseInt(body.get("totalTrips"), 0);
    d.successRate = parseDouble(body.get("successRate"), 100.0);
    d.rating = parseDouble(body.get("rating"), 5.0);
    d.base = string(body.getOrDefault("base", "HQ")).trim();
    Driver saved = drivers.save(d);
    logActivity("CREATE", "Driver", saved.driverId, "Added driver " + saved.name + " (" + saved.driverId + ")");

    if (body.containsKey("assignedVehicle") || body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vId = string(body.getOrDefault("assignedVehicle", body.getOrDefault("vehicleId", body.get("vehicle")))).trim();
      assignDriverToVehicle(saved, vId, org);
    }
    return driverDto(saved);
  }

  @Transactional
  public Map<String, Object> updateDriver(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Driver d = findDriver(id, org);

    if (body.containsKey("name")) {
      String n = string(body.get("name")).trim();
      if (!n.isBlank()) d.name = n;
    }
    if (body.containsKey("contact") || body.containsKey("phone")) {
      String c = string(body.getOrDefault("contact", body.get("phone"))).trim();
      if (!c.isBlank()) d.contact = c;
    }
    if (body.containsKey("status")) {
      d.status = string(body.get("status")).trim();
    }
    if (body.containsKey("totalTrips")) {
      d.totalTrips = parseInt(body.get("totalTrips"), d.totalTrips);
    }
    if (body.containsKey("successRate")) {
      d.successRate = parseDouble(body.get("successRate"), d.successRate);
    }
    if (body.containsKey("rating")) {
      d.rating = parseDouble(body.get("rating"), d.rating);
    }
    if (body.containsKey("base")) {
      d.base = string(body.get("base")).trim();
    }

    Driver saved = drivers.save(d);
    logActivity("UPDATE", "Driver", saved.driverId, "Updated driver " + saved.name + " (" + saved.driverId + ")");

    if (body.containsKey("assignedVehicle") || body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vId = string(body.getOrDefault("assignedVehicle", body.getOrDefault("vehicleId", body.get("vehicle")))).trim();
      assignDriverToVehicle(saved, vId, org);
    }
    return driverDto(saved);
  }

  @Transactional
  public Map<String, Object> updateDriverStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Driver d = findDriver(id, org);
    if (body.containsKey("status")) {
      d.status = string(body.get("status")).trim();
    }
    if (body.containsKey("base")) {
      d.base = string(body.get("base")).trim();
    }
    Driver saved = drivers.save(d);
    logActivity("STATUS_CHANGE", "Driver", saved.driverId, "Driver " + saved.driverId + " status updated to " + saved.status);
    return driverDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteDriver(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Driver d = findDriver(id, org);

    List<Vehicle> orgVehicles = vehicles.findAllByOrganization(org);
    for (Vehicle v : orgVehicles) {
      if (v.driver != null && Objects.equals(v.driver.id, d.id)) {
        v.driver = null;
        vehicles.save(v);
      }
    }

    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);
    for (LogisticsOrder o : orgOrders) {
      if (o.driver != null && Objects.equals(o.driver.id, d.id)) {
        o.driver = null;
        orders.save(o);
      }
    }

    List<Shipment> orgShipments = shipments.findAllByOrganization(org);
    for (Shipment s : orgShipments) {
      if (s.driver != null && Objects.equals(s.driver.id, d.id)) {
        s.driver = null;
        shipments.save(s);
      }
    }

    drivers.delete(d);
    logActivity("DELETE", "Driver", d.driverId, "Deleted driver " + d.name + " (" + d.driverId + ")");
    return map("deleted", true, "id", id, "message", "Driver " + d.driverId + " deleted successfully.");
  }

  private void assignDriverToVehicle(Driver driver, String targetVehicleId, Organization org) {
    List<Vehicle> orgVehicles = vehicles.findAllByOrganization(org);
    for (Vehicle v : orgVehicles) {
      if (v.driver != null && Objects.equals(v.driver.id, driver.id)) {
        if (targetVehicleId == null || targetVehicleId.isBlank() || "Unassigned".equalsIgnoreCase(targetVehicleId)
            || (!targetVehicleId.equalsIgnoreCase(v.vehicleId) && !targetVehicleId.equalsIgnoreCase(v.registration) && !Objects.equals(targetVehicleId, String.valueOf(v.id)))) {
          v.driver = null;
          vehicles.save(v);
        }
      }
    }

    if (targetVehicleId != null && !targetVehicleId.isBlank() && !"Unassigned".equalsIgnoreCase(targetVehicleId)) {
      Optional<Vehicle> targetOpt = vehicles.findByVehicleIdAndOrganization(targetVehicleId, org)
          .or(() -> parseLong(targetVehicleId).flatMap(pk -> vehicles.findByIdAndOrganization(pk, org)))
          .or(() -> orgVehicles.stream().filter(v -> targetVehicleId.equalsIgnoreCase(v.registration)).findFirst());

      if (targetOpt.isPresent()) {
        Vehicle target = targetOpt.get();
        target.driver = driver;
        vehicles.save(target);
      }
    }
  }

  public List<Map<String, Object>> routes() {
    Organization org = tenantContext.getCurrentOrganization();
    return routes.findAllByOrganization(org).stream().map(this::routeDto).toList();
  }

  public Map<String, Object> route(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return routeDto(findRoute(id, org));
  }

  @Transactional
  public Map<String, Object> createRoute(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();
    RoutePlan r = new RoutePlan();
    r.organization = org;
    r.owner = user;

    String customId = string(body.getOrDefault("routeId", body.get("id"))).trim();
    if (!customId.isBlank() && routes.findByRouteId(customId).isEmpty()) {
      r.routeId = customId;
    } else {
      r.routeId = nextRouteCode();
    }

    r.origin = string(body.getOrDefault("origin", "Origin Hub")).trim();
    r.destination = string(body.getOrDefault("destination", "Destination Hub")).trim();
    r.stops = string(body.getOrDefault("stops", "")).trim();
    r.distance = string(body.getOrDefault("distance", "250 km")).trim();
    r.estimatedTime = string(body.getOrDefault("estimatedTime", body.getOrDefault("time", "4h 30m"))).trim();
    r.fuelEstimate = string(body.getOrDefault("fuelEstimate", body.getOrDefault("fuel", "65 L"))).trim();
    r.status = string(body.getOrDefault("status", "Active")).trim();

    if (body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vVal = string(body.getOrDefault("vehicleId", body.get("vehicle"))).trim();
      if (vVal.isBlank() || "Unassigned".equalsIgnoreCase(vVal)) {
        r.vehicle = null;
      } else {
        r.vehicle = vehicles.findByVehicleIdAndOrganization(vVal, org).or(() ->
            vehicles.findAllByOrganization(org).stream().filter(v -> vVal.equalsIgnoreCase(v.vehicleId) || vVal.equalsIgnoreCase(v.registration)).findFirst()
        ).orElse(null);
      }
    }

    if (body.containsKey("driver") || body.containsKey("driverId")) {
      String dVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (dVal.isBlank() || "Unassigned".equalsIgnoreCase(dVal)) {
        r.driver = null;
      } else {
        r.driver = drivers.findByDriverIdAndOrganization(dVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> dVal.equalsIgnoreCase(d.driverId) || dVal.equalsIgnoreCase(d.name)).findFirst()
        ).orElse(null);
      }
    } else if (r.vehicle != null && r.vehicle.driver != null) {
      r.driver = r.vehicle.driver;
    }

    if (body.containsKey("originLat")) r.originLat = parseDoubleObj(body.get("originLat"));
    if (body.containsKey("originLng")) r.originLng = parseDoubleObj(body.get("originLng"));
    if (body.containsKey("destinationLat")) r.destinationLat = parseDoubleObj(body.get("destinationLat"));
    if (body.containsKey("destinationLng")) r.destinationLng = parseDoubleObj(body.get("destinationLng"));
    if (body.containsKey("stopsData")) r.stopsData = string(body.get("stopsData"));
    if (body.containsKey("routeGeometry")) r.routeGeometry = string(body.get("routeGeometry"));
    if (body.containsKey("optimizedOrder")) r.optimizedOrder = string(body.get("optimizedOrder"));
    r.createdAt = Instant.now();
    r.updatedAt = Instant.now();

    RoutePlan saved = routes.save(r);
    logActivity("CREATE", "Route", saved.routeId, "Created route " + saved.routeId + " (" + saved.origin + " -> " + saved.destination + ")");
    return routeDto(saved);
  }

  @Transactional
  public Map<String, Object> updateRoute(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    RoutePlan r = findRoute(id, org);

    if (body.containsKey("origin")) {
      String orig = string(body.get("origin")).trim();
      if (!orig.isBlank()) r.origin = orig;
    }
    if (body.containsKey("destination")) {
      String dest = string(body.get("destination")).trim();
      if (!dest.isBlank()) r.destination = dest;
    }
    if (body.containsKey("stops")) {
      r.stops = string(body.get("stops")).trim();
    }
    if (body.containsKey("distance")) {
      r.distance = string(body.get("distance")).trim();
    }
    if (body.containsKey("estimatedTime") || body.containsKey("time")) {
      r.estimatedTime = string(body.getOrDefault("estimatedTime", body.get("time"))).trim();
    }
    if (body.containsKey("fuelEstimate") || body.containsKey("fuel")) {
      r.fuelEstimate = string(body.getOrDefault("fuelEstimate", body.get("fuel"))).trim();
    }
    if (body.containsKey("status")) {
      r.status = string(body.get("status")).trim();
    }

    if (body.containsKey("vehicle") || body.containsKey("vehicleId")) {
      String vVal = string(body.getOrDefault("vehicleId", body.get("vehicle"))).trim();
      if (vVal.isBlank() || "Unassigned".equalsIgnoreCase(vVal)) {
        r.vehicle = null;
      } else {
        r.vehicle = vehicles.findByVehicleIdAndOrganization(vVal, org).or(() ->
            vehicles.findAllByOrganization(org).stream().filter(v -> vVal.equalsIgnoreCase(v.vehicleId) || vVal.equalsIgnoreCase(v.registration)).findFirst()
        ).orElse(r.vehicle);
      }
    }

    if (body.containsKey("driver") || body.containsKey("driverId")) {
      String dVal = string(body.getOrDefault("driverId", body.get("driver"))).trim();
      if (dVal.isBlank() || "Unassigned".equalsIgnoreCase(dVal)) {
        r.driver = null;
      } else {
        r.driver = drivers.findByDriverIdAndOrganization(dVal, org).or(() ->
            drivers.findAllByOrganization(org).stream().filter(d -> dVal.equalsIgnoreCase(d.driverId) || dVal.equalsIgnoreCase(d.name)).findFirst()
        ).orElse(r.driver);
      }
    }

    if (body.containsKey("originLat")) r.originLat = parseDoubleObj(body.get("originLat"));
    if (body.containsKey("originLng")) r.originLng = parseDoubleObj(body.get("originLng"));
    if (body.containsKey("destinationLat")) r.destinationLat = parseDoubleObj(body.get("destinationLat"));
    if (body.containsKey("destinationLng")) r.destinationLng = parseDoubleObj(body.get("destinationLng"));
    if (body.containsKey("stopsData")) r.stopsData = string(body.get("stopsData"));
    if (body.containsKey("routeGeometry")) r.routeGeometry = string(body.get("routeGeometry"));
    if (body.containsKey("optimizedOrder")) r.optimizedOrder = string(body.get("optimizedOrder"));
    r.updatedAt = Instant.now();

    RoutePlan saved = routes.save(r);
    logActivity("UPDATE", "Route", saved.routeId, "Updated route " + saved.routeId + " (" + saved.origin + " -> " + saved.destination + ")");
    return routeDto(saved);
  }

  @Transactional
  public Map<String, Object> updateRouteStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    RoutePlan r = findRoute(id, org);
    if (body.containsKey("status")) {
      r.status = string(body.get("status")).trim();
    }
    RoutePlan saved = routes.save(r);
    logActivity("STATUS_CHANGE", "Route", saved.routeId, "Route " + saved.routeId + " status updated to " + saved.status);
    if ("Delayed".equalsIgnoreCase(saved.status)) {
      notifyOperationalEvent("Route Delayed", "Route " + saved.routeId + " (" + saved.origin + " -> " + saved.destination + ") marked as Delayed.", "Route", "High");
    }
    return routeDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteRoute(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    RoutePlan r = findRoute(id, org);

    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);
    for (LogisticsOrder o : orgOrders) {
      if (o.route != null && Objects.equals(o.route.pk, r.pk)) {
        o.route = null;
        orders.save(o);
      }
    }

    List<Shipment> orgShipments = shipments.findAllByOrganization(org);
    for (Shipment s : orgShipments) {
      if (s.route != null && Objects.equals(s.route.pk, r.pk)) {
        s.route = null;
        shipments.save(s);
      }
    }

    routes.delete(r);
    logActivity("DELETE", "Route", r.routeId, "Deleted route " + r.routeId + " (" + r.origin + " -> " + r.destination + ")");
    return map("deleted", true, "id", id, "message", "Route " + r.routeId + " deleted successfully.");
  }

  public Map<String, Object> optimizeRoute(Map<String, Object> body) {
    String origin = body != null ? string(body.getOrDefault("origin", "Hyderabad")) : "Hyderabad";
    String dest = body != null ? string(body.getOrDefault("destination", "Vijayawada")) : "Vijayawada";
    String stops = body != null ? string(body.getOrDefault("stops", "Suryapet, Nandigama")) : "Suryapet, Nandigama";

    return map(
        "origin", origin,
        "destination", dest,
        "stops", stops,
        "original", map("distance", "420 km", "time", "7h 20m", "fuel", "116 L"),
        "optimized", map("distance", "365 km", "time", "6h 05m", "fuel", "98 L"),
        "savings", map("distance", "55 km", "time", "1h 15m", "fuel", "18 L"));
  }

  public List<Map<String, Object>> warehouses() {
    Organization org = tenantContext.getCurrentOrganization();
    return warehouses.findAllByOrganization(org).stream().map(this::warehouseDto).toList();
  }

  public Map<String, Object> warehouse(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Warehouse warehouse = findWarehouse(id, org);
    return warehouseDetailDto(warehouse);
  }

  @Transactional
  public Map<String, Object> createWarehouse(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();

    String name = string(body.get("name")).trim();
    if (name.isBlank()) {
      throw new IllegalArgumentException("Warehouse name is required.");
    }

    String code = string(body.get("warehouseCode")).trim();
    if (code.isBlank()) {
      code = string(body.get("id")).trim();
    }
    if (code.isBlank()) {
      code = nextWarehouseCode();
      while (warehouses.findByWarehouseCode(code).isPresent()) {
        code = nextWarehouseCode();
      }
    } else {
      if (warehouses.findByWarehouseCode(code).isPresent()) {
        throw new ConflictException("Warehouse code already exists: " + code);
      }
    }

    Warehouse w = new Warehouse();
    w.organization = org;
    w.owner = user;
    w.warehouseCode = code;
    w.name = name;
    w.location = string(body.get("location")).trim();
    w.capacity = body.containsKey("capacity") && !string(body.get("capacity")).isBlank() ? string(body.get("capacity")).trim() : "25,000 sq ft";
    w.occupancy = body.containsKey("occupancy") ? integer(body.get("occupancy"), 0) : 0;
    w.inventoryCount = body.containsKey("inventoryCount") ? integer(body.get("inventoryCount"), 0) : 0;
    w.status = body.containsKey("status") && !string(body.get("status")).isBlank() ? string(body.get("status")).trim() : "Active";
    w.incoming = body.containsKey("incoming") ? integer(body.get("incoming"), 0) : 0;
    w.outgoing = body.containsKey("outgoing") ? integer(body.get("outgoing"), 0) : 0;
    w.manager = string(body.get("manager")).trim();
    w.contact = string(body.get("contact")).trim();
    Warehouse saved = warehouses.save(w);
    logActivity("CREATE", "Warehouse", saved.warehouseCode, "Created warehouse " + saved.name + " (" + saved.warehouseCode + ")");
    return warehouseDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> updateWarehouse(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Warehouse w = findWarehouse(id, org);

    if (body.containsKey("name") && !string(body.get("name")).isBlank()) {
      w.name = string(body.get("name")).trim();
    }
    if (body.containsKey("location")) {
      w.location = string(body.get("location")).trim();
    }
    if (body.containsKey("capacity") && !string(body.get("capacity")).isBlank()) {
      w.capacity = string(body.get("capacity")).trim();
    }
    if (body.containsKey("occupancy")) {
      w.occupancy = integer(body.get("occupancy"), w.occupancy);
    }
    if (body.containsKey("inventoryCount")) {
      w.inventoryCount = integer(body.get("inventoryCount"), w.inventoryCount);
    }
    if (body.containsKey("status") && !string(body.get("status")).isBlank()) {
      w.status = string(body.get("status")).trim();
    }
    if (body.containsKey("incoming")) {
      w.incoming = integer(body.get("incoming"), w.incoming);
    }
    if (body.containsKey("outgoing")) {
      w.outgoing = integer(body.get("outgoing"), w.outgoing);
    }
    if (body.containsKey("manager")) {
      w.manager = string(body.get("manager")).trim();
    }
    if (body.containsKey("contact")) {
      w.contact = string(body.get("contact")).trim();
    }

    Warehouse saved = warehouses.save(w);
    logActivity("UPDATE", "Warehouse", saved.warehouseCode, "Updated warehouse " + saved.name + " (" + saved.warehouseCode + ")");
    if (saved.occupancy != null && saved.occupancy >= 90) {
      notifyOperationalEvent("High Warehouse Occupancy", "Warehouse " + saved.name + " reached " + saved.occupancy + "% occupancy.", "Warehouse", "High");
    }
    return warehouseDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> updateWarehouseStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Warehouse w = findWarehouse(id, org);
    String status = string(body.get("status")).trim();
    if (!status.isBlank()) {
      w.status = status;
    }
    Warehouse saved = warehouses.save(w);
    logActivity("STATUS_CHANGE", "Warehouse", saved.warehouseCode, "Warehouse " + saved.name + " status updated to " + saved.status);
    return warehouseDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteWarehouse(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Warehouse w = findWarehouse(id, org);

    long invCount = inventory.countByWarehouseAndOrganization(w, org);
    if (invCount > 0) {
      throw new IllegalStateException("Cannot delete warehouse '" + w.name + "' because it has " + invCount + " active inventory item(s). Please reassign or clear inventory first, or set status to Inactive.");
    }

    warehouses.delete(w);
    logActivity("DELETE", "Warehouse", w.warehouseCode, "Deleted warehouse " + w.name + " (" + w.warehouseCode + ")");
    return map("deleted", true, "id", id, "message", "Warehouse " + w.warehouseCode + " deleted successfully.");
  }

  // --- Products ---
  public List<Map<String, Object>> products() {
    Organization org = tenantContext.getCurrentOrganization();
    return products.findAllByOrganization(org).stream().map(this::productDto).toList();
  }

  public Map<String, Object> product(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Product p = findProduct(id, org);
    return productDetailDto(p);
  }

  @Transactional
  public Map<String, Object> createProduct(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();

    String name = string(body.get("name")).trim();
    if (name.isBlank()) {
      throw new IllegalArgumentException("Product name is required.");
    }

    String sku = string(body.get("sku")).trim();
    if (sku.isBlank()) {
      sku = nextProductSku();
      while (products.existsBySkuAndOrganization(sku, org)) {
        sku = nextProductSku();
      }
    } else {
      if (products.existsBySkuAndOrganization(sku, org)) {
        throw new ConflictException("Product SKU already exists in this organization: " + sku);
      }
    }

    Product p = new Product();
    p.organization = org;
    p.owner = user;
    p.sku = sku;
    p.name = name;
    p.category = body.containsKey("category") && !string(body.get("category")).isBlank() ? string(body.get("category")).trim() : "General";
    p.description = string(body.get("description")).trim();
    p.unit = body.containsKey("unit") && !string(body.get("unit")).isBlank() ? string(body.get("unit")).trim() : "units";
    p.price = body.containsKey("price") ? parseDouble(body.get("price"), 0.0) : 0.0;
    p.status = body.containsKey("status") && !string(body.get("status")).isBlank() ? string(body.get("status")).trim() : "Active";

    Product saved = products.save(p);
    logActivity("CREATE", "Product", saved.sku, "Created product " + saved.name + " (" + saved.sku + ")");
    return productDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> updateProduct(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Product p = findProduct(id, org);

    if (body.containsKey("name") && !string(body.get("name")).isBlank()) {
      p.name = string(body.get("name")).trim();
    }
    if (body.containsKey("sku") && !string(body.get("sku")).isBlank()) {
      String newSku = string(body.get("sku")).trim();
      if (!newSku.equalsIgnoreCase(p.sku) && products.existsBySkuAndOrganization(newSku, org)) {
        throw new ConflictException("Product SKU already exists in this organization: " + newSku);
      }
      p.sku = newSku;
    }
    if (body.containsKey("category") && !string(body.get("category")).isBlank()) {
      p.category = string(body.get("category")).trim();
    }
    if (body.containsKey("description")) {
      p.description = string(body.get("description")).trim();
    }
    if (body.containsKey("unit") && !string(body.get("unit")).isBlank()) {
      p.unit = string(body.get("unit")).trim();
    }
    if (body.containsKey("price")) {
      p.price = parseDouble(body.get("price"), p.price);
    }
    if (body.containsKey("status") && !string(body.get("status")).isBlank()) {
      p.status = string(body.get("status")).trim();
    }

    Product saved = products.save(p);
    logActivity("UPDATE", "Product", saved.sku, "Updated product " + saved.name + " (" + saved.sku + ")");
    return productDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> updateProductStatus(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    Product p = findProduct(id, org);
    String status = string(body.get("status")).trim();
    if (!status.isBlank()) {
      p.status = status;
    }
    Product saved = products.save(p);
    logActivity("STATUS_CHANGE", "Product", saved.sku, "Product " + saved.name + " status updated to " + saved.status);
    return productDetailDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteProduct(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Product p = findProduct(id, org);

    long invCount = inventory.countByProductAndOrganization(p, org);
    if (invCount > 0) {
      throw new IllegalStateException("Cannot delete product '" + p.name + "' because it has " + invCount + " active inventory item(s) in warehouse(s). Reassign or clear inventory first, or set status to Discontinued.");
    }

    products.delete(p);
    logActivity("DELETE", "Product", p.sku, "Deleted product " + p.name + " (" + p.sku + ")");
    return map("deleted", true, "id", id, "message", "Product " + p.sku + " deleted successfully.");
  }

  // --- Inventory ---
  public List<Map<String, Object>> inventory() {
    Organization org = tenantContext.getCurrentOrganization();
    return inventory.findAllByOrganization(org).stream().map(this::inventoryDto).toList();
  }

  public Map<String, Object> inventoryItem(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    InventoryItem item = findInventoryItem(id, org);
    return inventoryDto(item);
  }

  @Transactional
  public Map<String, Object> createInventory(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = tenantContext.getCurrentUser();

    String pRef = string(body.getOrDefault("productId", body.getOrDefault("sku", body.get("product")))).trim();
    if (pRef.isBlank()) {
      throw new IllegalArgumentException("Product is required.");
    }
    Product prod = findProduct(pRef, org);

    String wRef = string(body.getOrDefault("warehouseId", body.getOrDefault("warehouseCode", body.get("warehouse")))).trim();
    if (wRef.isBlank()) {
      throw new IllegalArgumentException("Warehouse is required.");
    }
    Warehouse wh = findWarehouse(wRef, org);

    if (inventory.findByProductAndWarehouseAndOrganization(prod, wh, org).isPresent()) {
      throw new ConflictException("Inventory item already exists for product '" + prod.name + "' in warehouse '" + wh.name + "'. Use stock adjustment instead.");
    }

    int qty = integer(body.get("quantity"), 0);
    if (qty < 0) {
      throw new IllegalArgumentException("Quantity cannot be negative.");
    }

    int res = integer(body.get("reserved"), 0);
    if (res < 0) {
      throw new IllegalArgumentException("Reserved quantity cannot be negative.");
    }
    if (res > qty) {
      throw new IllegalArgumentException("Reserved quantity cannot exceed total quantity.");
    }

    int reorder = integer(body.get("reorderLevel"), 0);
    if (reorder < 0) {
      throw new IllegalArgumentException("Reorder level cannot be negative.");
    }

    InventoryItem item = new InventoryItem();
    item.organization = org;
    item.owner = user;
    item.product = prod;
    item.warehouse = wh;
    item.quantity = qty;
    item.reserved = res;
    item.reorderLevel = reorder;

    InventoryItem saved = inventory.save(item);
    syncWarehouseStock(wh, org);
    logActivity("CREATE", "Inventory", (prod != null ? prod.sku : String.valueOf(saved.id)), "Added inventory item for " + (prod != null ? prod.name : "product") + " to warehouse " + wh.name);
    return inventoryDto(saved);
  }

  @Transactional
  public Map<String, Object> updateInventory(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    InventoryItem item = findInventoryItem(id, org);

    if (body.containsKey("warehouseId") || body.containsKey("warehouseCode") || body.containsKey("warehouse")) {
      String wRef = string(body.getOrDefault("warehouseId", body.getOrDefault("warehouseCode", body.get("warehouse")))).trim();
      if (!wRef.isBlank()) {
        Warehouse newWh = findWarehouse(wRef, org);
        if (!Objects.equals(newWh.id, item.warehouse.id)) {
          if (inventory.findByProductAndWarehouseAndOrganization(item.product, newWh, org).isPresent()) {
            throw new ConflictException("Inventory already exists for product in target warehouse: " + newWh.name);
          }
          Warehouse oldWh = item.warehouse;
          item.warehouse = newWh;
          syncWarehouseStock(oldWh, org);
        }
      }
    }

    int qty = body.containsKey("quantity") ? integer(body.get("quantity"), item.quantity) : item.quantity;
    if (qty < 0) {
      throw new IllegalArgumentException("Quantity cannot be negative.");
    }

    int res = body.containsKey("reserved") ? integer(body.get("reserved"), item.reserved) : item.reserved;
    if (res < 0) {
      throw new IllegalArgumentException("Reserved quantity cannot be negative.");
    }
    if (res > qty) {
      throw new IllegalArgumentException("Reserved quantity cannot exceed total quantity.");
    }

    int reorder = body.containsKey("reorderLevel") ? integer(body.get("reorderLevel"), item.reorderLevel) : item.reorderLevel;
    if (reorder < 0) {
      throw new IllegalArgumentException("Reorder level cannot be negative.");
    }

    item.quantity = qty;
    item.reserved = res;
    item.reorderLevel = reorder;

    InventoryItem saved = inventory.save(item);
    syncWarehouseStock(item.warehouse, org);
    String prodName = (saved.product != null ? saved.product.name : "Product");
    String prodSku = (saved.product != null ? saved.product.sku : String.valueOf(saved.id));
    logActivity("UPDATE", "Inventory", prodSku, "Updated inventory for " + prodName + " in " + (saved.warehouse != null ? saved.warehouse.name : "warehouse"));
    return inventoryDto(saved);
  }

  @Transactional
  public Map<String, Object> adjustInventory(String id, Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();
    InventoryItem item = findInventoryItem(id, org);

    if (body.containsKey("adjustment")) {
      int delta = integer(body.get("adjustment"), 0);
      int newQty = item.quantity + delta;
      if (newQty < 0) {
        throw new IllegalArgumentException("Adjusted quantity cannot result in negative stock.");
      }
      item.quantity = newQty;
    } else if (body.containsKey("quantity")) {
      int newQty = integer(body.get("quantity"), item.quantity);
      if (newQty < 0) {
        throw new IllegalArgumentException("Quantity cannot be negative.");
      }
      item.quantity = newQty;
    }

    if (body.containsKey("reserved")) {
      int newRes = integer(body.get("reserved"), item.reserved);
      if (newRes < 0) {
        throw new IllegalArgumentException("Reserved quantity cannot be negative.");
      }
      if (newRes > item.quantity) {
        throw new IllegalArgumentException("Reserved quantity cannot exceed total quantity.");
      }
      item.reserved = newRes;
    }

    if (body.containsKey("reorderLevel")) {
      int newReorder = integer(body.get("reorderLevel"), item.reorderLevel);
      if (newReorder < 0) {
        throw new IllegalArgumentException("Reorder level cannot be negative.");
      }
      item.reorderLevel = newReorder;
    }

    InventoryItem saved = inventory.save(item);
    syncWarehouseStock(item.warehouse, org);
    String prodName = (saved.product != null ? saved.product.name : "Product");
    String prodSku = (saved.product != null ? saved.product.sku : String.valueOf(saved.id));
    logActivity("STOCK_ADJUSTMENT", "Inventory", prodSku, "Adjusted inventory for " + prodName + " - Qty: " + saved.quantity + ", Reserved: " + saved.reserved);
    if (saved.quantity - saved.reserved <= saved.reorderLevel) {
      notifyOperationalEvent("Low Inventory Warning", "Product " + prodName + " is at or below reorder level (" + (saved.quantity - saved.reserved) + " available).", "Inventory", "High");
    }
    return inventoryDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteInventory(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    InventoryItem item = findInventoryItem(id, org);
    Warehouse wh = item.warehouse;

    inventory.delete(item);
    syncWarehouseStock(wh, org);
    String prodName = (item.product != null ? item.product.name : "Product");
    String prodSku = (item.product != null ? item.product.sku : id);
    logActivity("DELETE", "Inventory", prodSku, "Removed inventory item " + prodSku + " (" + prodName + ") from warehouse " + (wh != null ? wh.name : ""));
    return map("deleted", true, "id", id, "message", "Inventory item " + (item.product != null ? item.product.sku : id) + " removed successfully.");
  }

  public List<Map<String, Object>> notifications() {
    Organization org = tenantContext.getCurrentOrganization();
    return notifications.findAllByOrganization(org).stream()
        .sorted(Comparator.comparing((Notification n) -> n.createdAt).reversed())
        .map(this::notificationDto).toList();
  }

  @Transactional
  public Map<String, Object> markNotificationRead(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Notification notification = notifications.findByNotificationIdAndOrganization(id, org)
        .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    notification.readFlag = true;
    return notificationDto(notifications.save(notification));
  }

  public List<Map<String, Object>> tracking() {
    Organization org = tenantContext.getCurrentOrganization();
    return vehicles.findAllByOrganization(org).stream().map(vehicle -> {
      Optional<TrackingEvent> latest = trackingEvents.findFirstByVehicleVehicleIdAndOrganizationOrderByTimestampDesc(vehicle.vehicleId, org);
      return trackingVehicleDto(vehicle, latest.orElse(null));
    }).toList();
  }

  public List<Map<String, Object>> trackingEvents() {
    Organization org = tenantContext.getCurrentOrganization();
    return trackingEvents.findAllByOrganizationOrderByTimestampDesc(org).stream().map(this::trackingEventDto).toList();
  }

  public Map<String, Object> trackingEvent(Long id) {
    Organization org = tenantContext.getCurrentOrganization();
    TrackingEvent te = trackingEvents.findByIdAndOrganization(id, org)
        .orElseThrow(() -> new ResourceNotFoundException("Tracking event not found: " + id));
    return trackingEventDto(te);
  }

  public List<Map<String, Object>> trackingForShipment(String shipmentId) {
    Organization org = tenantContext.getCurrentOrganization();
    Shipment shipment = findShipment(shipmentId, org);
    return trackingEvents.findByShipmentAndOrganizationOrderByTimestampDesc(shipment, org).stream().map(this::trackingEventDto).toList();
  }

  public List<Map<String, Object>> trackingForVehicle(String vehicleId) {
    Organization org = tenantContext.getCurrentOrganization();
    Vehicle vehicle = findVehicle(vehicleId, org);
    return trackingEvents.findByVehicleAndOrganizationOrderByTimestampDesc(vehicle, org).stream().map(this::trackingEventDto).toList();
  }

  @Transactional
  public Map<String, Object> createTrackingEvent(Map<String, Object> body) {
    Organization org = tenantContext.getCurrentOrganization();

    TrackingEvent te = new TrackingEvent();
    te.organization = org;
    te.timestamp = Instant.now();

    if (body.containsKey("shipmentId") || body.containsKey("shipment")) {
      String sId = string(body.getOrDefault("shipmentId", body.get("shipment"))).trim();
      if (!sId.isBlank() && !"Unassigned".equalsIgnoreCase(sId)) {
        te.shipment = findShipment(sId, org);
      }
    }

    if (body.containsKey("vehicleId") || body.containsKey("vehicle")) {
      String vId = string(body.getOrDefault("vehicleId", body.get("vehicle"))).trim();
      if (!vId.isBlank() && !"Unassigned".equalsIgnoreCase(vId)) {
        te.vehicle = findVehicle(vId, org);
      }
    } else if (te.shipment != null && te.shipment.vehicle != null) {
      te.vehicle = te.shipment.vehicle;
    }

    te.status = string(body.getOrDefault("status", te.shipment != null ? te.shipment.status : "In Transit")).trim();
    te.speed = string(body.getOrDefault("speed", "55 km/h")).trim();
    te.eta = string(body.getOrDefault("eta", te.shipment != null ? te.shipment.eta : "On schedule")).trim();
    te.location = string(body.getOrDefault("location", te.vehicle != null ? te.vehicle.location : "En route")).trim();
    te.latitude = parseDouble(body.get("latitude"), 17.3850);
    te.longitude = parseDouble(body.get("longitude"), 78.4867);
    te.mapX = parseInt(body.get("mapX"), 35);
    te.mapY = parseInt(body.get("mapY"), 42);
    te.destinationX = parseInt(body.get("destinationX"), 68);
    te.destinationY = parseInt(body.get("destinationY"), 58);
    te.routeAngle = parseInt(body.get("routeAngle"), 18);
    te.routeLength = parseInt(body.get("routeLength"), 180);

    TrackingEvent saved = trackingEvents.save(te);

    if (te.vehicle != null) {
      if (!te.status.isBlank()) te.vehicle.status = te.status;
      if (!te.location.isBlank()) te.vehicle.location = te.location;
      te.vehicle.currentLat = te.latitude;
      te.vehicle.currentLng = te.longitude;
      te.vehicle.lastUpdated = "Just now";
      vehicles.save(te.vehicle);
    }

    return trackingEventDto(saved);
  }

  @Transactional
  public Map<String, Object> deleteTrackingEvent(Long id) {
    Organization org = tenantContext.getCurrentOrganization();
    TrackingEvent te = trackingEvents.findByIdAndOrganization(id, org)
        .orElseThrow(() -> new ResourceNotFoundException("Tracking event not found: " + id));
    trackingEvents.delete(te);
    return map("deleted", true, "id", id, "message", "Tracking event deleted successfully.");
  }

  private void applyOrder(LogisticsOrder order, Map<String, Object> body, Organization org, AppUser user) {
    String customerName = string(body.getOrDefault("customer", body.getOrDefault("customerName", "")));
    String contact = string(body.getOrDefault("contact", ""));
    String email = string(body.getOrDefault("email", ""));

    Customer customer = order.customer;
    if (customer == null) {
      if (!email.isBlank()) {
        customer = customers.findByEmailAndOrganization(email, org).orElse(null);
      }
      if (customer == null) {
        customer = new Customer(customerName.isBlank() ? "New Customer" : customerName, contact, email, org);
        customer.owner = user;
      }
    }
    if (!customerName.isBlank()) customer.name = customerName;
    if (!contact.isBlank()) customer.contact = contact;
    if (!email.isBlank()) customer.email = email;
    customer.organization = org;
    order.customer = customers.save(customer);

    order.origin = string(body.getOrDefault("origin", body.getOrDefault("pickup", order.origin)));
    order.destination = string(body.getOrDefault("destination", body.getOrDefault("delivery", order.destination)));
    order.cargo = string(body.getOrDefault("cargo", order.cargo));
    order.weight = string(body.getOrDefault("weight", order.weight));
    order.priority = string(body.getOrDefault("priority", order.priority == null ? "Standard" : order.priority));
    order.status = string(body.getOrDefault("status", order.status == null ? "Pending" : order.status));
    order.eta = string(body.getOrDefault("eta", order.eta == null ? "Pending schedule" : order.eta));
    order.createdDate = order.createdDate == null ? LocalDate.now() : order.createdDate;

    String pickupDateStr = string(body.get("pickupDate"));
    if (!pickupDateStr.isBlank()) {
      try {
        order.pickupDate = LocalDate.parse(pickupDateStr);
      } catch (Exception ignored) {}
    }
    String deliveryDateStr = string(body.get("deliveryDate"));
    if (!deliveryDateStr.isBlank()) {
      try {
        order.deliveryDate = LocalDate.parse(deliveryDateStr);
      } catch (Exception ignored) {}
    }

    if (body.containsKey("vehicle")) {
      String vehicleId = string(body.get("vehicle")).trim();
      if (vehicleId.isBlank() || "Unassigned".equalsIgnoreCase(vehicleId)) {
        order.vehicle = null;
      } else {
        order.vehicle = vehicles.findByVehicleIdAndOrganization(vehicleId, org).orElse(order.vehicle);
      }
    }

    if (body.containsKey("driver")) {
      String driverName = string(body.get("driver")).trim();
      if (driverName.isBlank() || "Unassigned".equalsIgnoreCase(driverName)) {
        order.driver = null;
      } else {
        order.driver = drivers.findAllByOrganization(org).stream()
            .filter(d -> d.name.equalsIgnoreCase(driverName) || d.driverId.equalsIgnoreCase(driverName))
            .findFirst()
            .orElse(order.driver);
      }
    }

    if (body.containsKey("route")) {
      String routeVal = string(body.get("route")).trim();
      if (routeVal.isBlank() || "Unassigned".equalsIgnoreCase(routeVal)) {
        order.route = null;
      } else {
        order.route = routes.findByRouteIdAndOrganization(routeVal, org).or(() ->
            routes.findAllByOrganization(org).stream()
                .filter(r -> routeVal.equalsIgnoreCase(r.routeId)
                    || routeVal.equalsIgnoreCase(r.origin + " to " + r.destination)
                    || routeVal.equalsIgnoreCase(r.origin + " -> " + r.destination))
                .findFirst()
        ).orElse(order.route);
      }
    }
  }

  private LogisticsOrder findOrder(String id, Organization org) {
    return orders.findByOrderIdAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> orders.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
  }

  private Shipment findShipment(String id, Organization org) {
    return shipments.findByShipmentIdAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> shipments.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Shipment not found: " + id));
  }

  private Vehicle findVehicle(String id, Organization org) {
    return vehicles.findByVehicleIdAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> vehicles.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
  }

  private Driver findDriver(String id, Organization org) {
    return drivers.findByDriverIdAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> drivers.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + id));
  }

  private Warehouse findWarehouse(String id, Organization org) {
    return warehouses.findByWarehouseCodeAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> warehouses.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found: " + id));
  }

  private RoutePlan findRoute(String id, Organization org) {
    return routes.findByRouteIdAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> routes.findByPkAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Route not found: " + id));
  }

  private Product findProduct(String id, Organization org) {
    return products.findBySkuAndOrganization(id, org)
        .or(() -> parseLong(id).flatMap(pk -> products.findByIdAndOrganization(pk, org)))
        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
  }

  private InventoryItem findInventoryItem(String id, Organization org) {
    return parseLong(id).flatMap(pk -> inventory.findByIdAndOrganization(pk, org))
        .or(() -> {
          return products.findBySkuAndOrganization(id, org)
              .flatMap(p -> inventory.findByProductAndOrganization(p, org).stream().findFirst());
        })
        .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found: " + id));
  }

  private Map<String, Object> orderDto(LogisticsOrder order) {
    String customerName = order.customer != null ? order.customer.name : "";
    String customerContact = order.customer != null ? order.customer.contact : "";
    String customerEmail = order.customer != null ? order.customer.email : "";
    String vehicleId = order.vehicle != null ? order.vehicle.vehicleId : "Unassigned";
    String driverName = order.driver != null ? order.driver.name : "Unassigned";
    String pickupDate = order.pickupDate != null ? order.pickupDate.toString() : "";
    String deliveryDate = order.deliveryDate != null ? order.deliveryDate.toString() : "";
    String routeName = "";
    String routeId = "";
    if (order.route != null) {
      String o = order.route.origin != null ? order.route.origin : "";
      String d = order.route.destination != null ? order.route.destination : "";
      routeName = (!o.isBlank() && !d.isBlank()) ? (o + " to " + d) : (order.route.routeId != null ? order.route.routeId : "");
      routeId = order.route.routeId != null ? order.route.routeId : "";
    } else if (order.origin != null && !order.origin.isBlank() && order.destination != null && !order.destination.isBlank()) {
      Optional<RoutePlan> matched = (order.organization != null ? routes.findAllByOrganization(order.organization) : routes.findAll()).stream()
          .filter(r -> order.origin.equalsIgnoreCase(r.origin) && order.destination.equalsIgnoreCase(r.destination))
          .findFirst();
      if (matched.isPresent()) {
        RoutePlan r = matched.get();
        routeName = r.origin + " to " + r.destination;
        routeId = r.routeId;
      }
    }

    return map(
        "id", order.orderId,
        "orderId", order.orderId,
        "customer", customerName,
        "contact", customerContact,
        "email", customerEmail,
        "origin", order.origin == null ? "" : order.origin,
        "destination", order.destination == null ? "" : order.destination,
        "cargo", order.cargo == null ? "" : order.cargo,
        "weight", order.weight == null ? "" : order.weight,
        "priority", order.priority == null ? "Standard" : order.priority,
        "status", order.status == null ? "Pending" : order.status,
        "vehicle", vehicleId,
        "driver", driverName,
        "eta", order.eta == null ? "" : order.eta,
        "createdDate", order.createdDate == null ? "" : order.createdDate.toString(),
        "pickupDate", pickupDate,
        "deliveryDate", deliveryDate,
        "route", routeName,
        "routeId", routeId
    );
  }

  private Map<String, Object> shipmentDto(Shipment shipment) {
    LogisticsOrder order = shipment.order;
    String createdDate = shipment.createdDate != null ? shipment.createdDate.toString() :
        (order != null && order.createdDate != null ? order.createdDate.toString() : "");
    String vehicleName = shipment.vehicle == null ? "Unassigned" : shipment.vehicle.vehicleId;
    String driverName = shipment.driver == null ? "Unassigned" : shipment.driver.name;
    String customerName = (order != null && order.customer != null) ? order.customer.name : "";
    String cargo = (order != null && order.cargo != null) ? order.cargo : "";
    String weight = (order != null && order.weight != null) ? order.weight : "";
    String priority = (order != null && order.priority != null) ? order.priority : "";

    return map(
        "id", shipment.shipmentId,
        "shipmentId", shipment.shipmentId,
        "orderId", order == null ? "" : order.orderId,
        "origin", order == null ? "" : (order.origin == null ? "" : order.origin),
        "destination", order == null ? "" : (order.destination == null ? "" : order.destination),
        "currentLocation", shipment.currentLocation == null ? "" : shipment.currentLocation,
        "status", shipment.status == null ? "Pending" : shipment.status,
        "eta", shipment.eta == null ? "" : shipment.eta,
        "vehicle", vehicleName,
        "vehicleId", shipment.vehicle == null ? "" : shipment.vehicle.vehicleId,
        "driver", driverName,
        "driverId", shipment.driver == null ? "" : shipment.driver.driverId,
        "stage", shipment.stage == null ? "Order Created" : shipment.stage,
        "createdDate", createdDate,
        "customer", customerName,
        "cargo", cargo,
        "weight", weight,
        "priority", priority,
        "route", shipment.route == null ? "" : (shipment.route.origin + " -> " + shipment.route.destination),
        "routeId", shipment.route == null ? "" : shipment.route.routeId
    );
  }

  private Map<String, Object> vehicleDto(Vehicle vehicle) {
    String driverName = vehicle.driver == null ? "Unassigned" : vehicle.driver.name;
    String driverId = vehicle.driver == null ? "" : vehicle.driver.driverId;

    String activeShipmentId = "";
    String activeOrderId = "";
    if (vehicle.organization != null) {
      Optional<Shipment> active = shipments.findAllByOrganization(vehicle.organization).stream()
          .filter(s -> s.vehicle != null && Objects.equals(s.vehicle.id, vehicle.id) && !"Delivered".equalsIgnoreCase(s.status) && !"Cancelled".equalsIgnoreCase(s.status))
          .findFirst();
      if (active.isPresent()) {
        activeShipmentId = active.get().shipmentId;
        if (active.get().order != null) activeOrderId = active.get().order.orderId;
      }
    }

    return map(
        "id", vehicle.vehicleId,
        "vehicleId", vehicle.vehicleId,
        "registration", vehicle.registration == null ? "" : vehicle.registration,
        "type", vehicle.type == null ? "Container Truck" : vehicle.type,
        "capacity", vehicle.capacity == null ? "" : vehicle.capacity,
        "capacityValue", vehicle.capacityValue == null ? 0.0 : vehicle.capacityValue,
        "currentLoad", vehicle.currentLoad == null ? 0 : vehicle.currentLoad,
        "driver", driverName,
        "driverId", driverId,
        "status", vehicle.status == null ? "Available" : vehicle.status,
        "location", vehicle.location == null ? "Hub" : vehicle.location,
        "lastUpdated", vehicle.lastUpdated == null ? "Just now" : vehicle.lastUpdated,
        "maintenance", vehicle.maintenance == null ? "Clear" : vehicle.maintenance,
        "route", vehicle.route == null ? "Unassigned" : vehicle.route,
        "utilization", vehicle.utilization == null ? 0 : vehicle.utilization,
        "activeShipment", activeShipmentId,
        "activeOrder", activeOrderId
    );
  }

  private Map<String, Object> driverDto(Driver driver) {
    String assignedVehicle = "Unassigned";
    String assignedVehicleId = "";
    String assignedVehicleReg = "";
    if (driver.organization != null) {
      Optional<Vehicle> vOpt = vehicles.findAllByOrganization(driver.organization).stream()
          .filter(v -> v.driver != null && Objects.equals(v.driver.id, driver.id))
          .findFirst();
      if (vOpt.isPresent()) {
        Vehicle v = vOpt.get();
        assignedVehicle = v.vehicleId;
        assignedVehicleId = v.vehicleId;
        assignedVehicleReg = v.registration != null ? v.registration : "";
      }
    }

    String activeShipmentId = "";
    String activeOrderId = "";
    if (driver.organization != null) {
      Optional<Shipment> sOpt = shipments.findAllByOrganization(driver.organization).stream()
          .filter(s -> s.driver != null && Objects.equals(s.driver.id, driver.id) && !"Delivered".equalsIgnoreCase(s.status) && !"Cancelled".equalsIgnoreCase(s.status))
          .findFirst();
      if (sOpt.isPresent()) {
        Shipment s = sOpt.get();
        activeShipmentId = s.shipmentId;
        if (s.order != null) activeOrderId = s.order.orderId;
      }
    }

    String successRateStr;
    if (driver.successRate != null) {
      successRateStr = String.format(Locale.US, "%.1f%%", driver.successRate);
    } else {
      successRateStr = "100.0%";
    }

    return map(
        "id", driver.driverId,
        "driverId", driver.driverId,
        "name", driver.name == null ? "" : driver.name,
        "contact", driver.contact == null ? "" : driver.contact,
        "phone", driver.contact == null ? "" : driver.contact,
        "assignedVehicle", assignedVehicle,
        "assignedVehicleId", assignedVehicleId,
        "assignedVehicleReg", assignedVehicleReg,
        "activeShipment", activeShipmentId,
        "activeOrder", activeOrderId,
        "status", driver.status == null ? "Available" : driver.status,
        "totalTrips", driver.totalTrips == null ? 0 : driver.totalTrips,
        "successRate", successRateStr,
        "successRateValue", driver.successRate == null ? 100.0 : driver.successRate,
        "rating", driver.rating == null ? 5.0 : driver.rating,
        "base", driver.base == null ? "HQ" : driver.base
    );
  }

  private Map<String, Object> routeDto(RoutePlan route) {
    String vehicleId = route.vehicle == null ? "Unassigned" : route.vehicle.vehicleId;
    String vehicleReg = (route.vehicle != null && route.vehicle.registration != null) ? route.vehicle.registration : "";

    Driver resolvedDriver = route.driver != null ? route.driver : (route.vehicle != null ? route.vehicle.driver : null);
    String driverName = resolvedDriver == null ? "Unassigned" : resolvedDriver.name;
    String driverId = resolvedDriver == null ? "" : resolvedDriver.driverId;

    long activeShipmentsCount = 0;
    long activeOrdersCount = 0;
    if (route.organization != null) {
      activeShipmentsCount = shipments.findAllByOrganization(route.organization).stream()
          .filter(s -> s.route != null && Objects.equals(s.route.pk, route.pk) && !"Delivered".equalsIgnoreCase(s.status) && !"Cancelled".equalsIgnoreCase(s.status))
          .count();
      activeOrdersCount = orders.findAllByOrganization(route.organization).stream()
          .filter(o -> o.route != null && Objects.equals(o.route.pk, route.pk) && !"Delivered".equalsIgnoreCase(o.status) && !"Cancelled".equalsIgnoreCase(o.status))
          .count();
    }

    return map(
        "id", route.routeId,
        "routeId", route.routeId,
        "origin", route.origin == null ? "" : route.origin,
        "destination", route.destination == null ? "" : route.destination,
        "stops", route.stops == null ? "" : route.stops,
        "vehicle", vehicleId,
        "vehicleId", vehicleId,
        "vehicleReg", vehicleReg,
        "driver", driverName,
        "driverId", driverId,
        "distance", route.distance == null ? "" : route.distance,
        "time", route.estimatedTime == null ? "" : route.estimatedTime,
        "estimatedTime", route.estimatedTime == null ? "" : route.estimatedTime,
        "fuel", route.fuelEstimate == null ? "" : route.fuelEstimate,
        "fuelEstimate", route.fuelEstimate == null ? "" : route.fuelEstimate,
        "status", route.status == null ? "Active" : route.status,
        "originLat", route.originLat,
        "originLng", route.originLng,
        "destinationLat", route.destinationLat,
        "destinationLng", route.destinationLng,
        "stopsData", route.stopsData == null ? "" : route.stopsData,
        "routeGeometry", route.routeGeometry == null ? "" : route.routeGeometry,
        "optimizedOrder", route.optimizedOrder == null ? "" : route.optimizedOrder,
        "createdAt", route.createdAt != null ? route.createdAt.toString() : "",
        "updatedAt", route.updatedAt != null ? route.updatedAt.toString() : "",
        "activeShipmentsCount", activeShipmentsCount,
        "activeOrdersCount", activeOrdersCount
    );
  }

  private Map<String, Object> warehouseDto(Warehouse warehouse) {
    Organization org = warehouse.organization;
    List<InventoryItem> items = org != null ? inventory.findByWarehouseAndOrganization(warehouse, org) : List.of();
    int calcTotalStock = items.stream().mapToInt(i -> i.quantity != null ? i.quantity : 0).sum();
    int count = calcTotalStock > 0 ? calcTotalStock : (warehouse.inventoryCount != null ? warehouse.inventoryCount : 0);

    return map(
        "id", warehouse.warehouseCode,
        "warehouseCode", warehouse.warehouseCode,
        "name", warehouse.name,
        "location", warehouse.location != null ? warehouse.location : "",
        "capacity", warehouse.capacity != null ? warehouse.capacity : "25,000 sq ft",
        "occupancy", warehouse.occupancy != null ? warehouse.occupancy : 0,
        "inventoryCount", count,
        "inventoryItemsCount", items.size(),
        "status", warehouse.status != null ? warehouse.status : "Active",
        "incoming", warehouse.incoming != null ? warehouse.incoming : 0,
        "outgoing", warehouse.outgoing != null ? warehouse.outgoing : 0,
        "manager", warehouse.manager != null ? warehouse.manager : "",
        "contact", warehouse.contact != null ? warehouse.contact : ""
    );
  }

  private Map<String, Object> warehouseDetailDto(Warehouse warehouse) {
    Map<String, Object> dto = new LinkedHashMap<>(warehouseDto(warehouse));
    Organization org = warehouse.organization;
    if (org == null) {
      dto.put("inventory", List.of());
      dto.put("incomingShipments", List.of());
      dto.put("outgoingShipments", List.of());
      dto.put("activeOrders", List.of());
      dto.put("lowStockCount", 0);
      return dto;
    }

    // 1. Inventory Items stored in this warehouse
    List<InventoryItem> items = inventory.findByWarehouseAndOrganization(warehouse, org);
    List<Map<String, Object>> inventoryList = items.stream().map(this::inventoryDto).toList();
    dto.put("inventory", inventoryList);
    int lowStockCount = (int) items.stream().filter(i -> (i.available() <= (i.reorderLevel != null ? i.reorderLevel : 0))).count();
    dto.put("lowStockCount", lowStockCount);

    // 2. Incoming & Outgoing Shipments and Orders related to this warehouse
    String whName = (warehouse.name != null ? warehouse.name : "").toLowerCase();
    String whCode = (warehouse.warehouseCode != null ? warehouse.warehouseCode : "").toLowerCase();
    String whLoc = (warehouse.location != null ? warehouse.location : "").toLowerCase();
    List<String> keywords = new ArrayList<>();
    if (!whName.isBlank()) keywords.add(whName);
    if (!whCode.isBlank()) keywords.add(whCode);
    if (!whLoc.isBlank()) {
      keywords.add(whLoc);
      for (String part : whLoc.split(",")) {
        String p = part.trim();
        if (p.length() > 2) keywords.add(p);
      }
    }

    List<Shipment> orgShipments = shipments.findAllByOrganization(org);
    List<Map<String, Object>> incomingShipments = new ArrayList<>();
    List<Map<String, Object>> outgoingShipments = new ArrayList<>();

    for (Shipment s : orgShipments) {
      String dest = s.order != null && s.order.destination != null ? s.order.destination.toLowerCase() : "";
      String orig = s.order != null && s.order.origin != null ? s.order.origin.toLowerCase() : "";
      String curr = s.currentLocation != null ? s.currentLocation.toLowerCase() : "";

      boolean isIncoming = matchesAny(dest, keywords) || (matchesAny(curr, keywords) && !"Delivered".equalsIgnoreCase(s.status));
      boolean isOutgoing = matchesAny(orig, keywords);

      if (isIncoming) {
        incomingShipments.add(map(
            "id", s.shipmentId,
            "orderId", s.order != null ? s.order.orderId : "N/A",
            "vehicle", s.vehicle != null ? s.vehicle.registration : "Unassigned",
            "driver", s.driver != null ? s.driver.name : "Unassigned",
            "origin", s.order != null ? s.order.origin : "N/A",
            "destination", s.order != null ? s.order.destination : "N/A",
            "status", s.status,
            "eta", s.eta != null ? s.eta : "N/A"
        ));
      }
      if (isOutgoing) {
        outgoingShipments.add(map(
            "id", s.shipmentId,
            "orderId", s.order != null ? s.order.orderId : "N/A",
            "vehicle", s.vehicle != null ? s.vehicle.registration : "Unassigned",
            "driver", s.driver != null ? s.driver.name : "Unassigned",
            "origin", s.order != null ? s.order.origin : "N/A",
            "destination", s.order != null ? s.order.destination : "N/A",
            "status", s.status,
            "eta", s.eta != null ? s.eta : "N/A"
        ));
      }
    }

    dto.put("incomingShipments", incomingShipments);
    dto.put("outgoingShipments", outgoingShipments);
    if (!incomingShipments.isEmpty()) {
      dto.put("incoming", Math.max(incomingShipments.size(), (int) dto.getOrDefault("incoming", 0)));
    }
    if (!outgoingShipments.isEmpty()) {
      dto.put("outgoing", Math.max(outgoingShipments.size(), (int) dto.getOrDefault("outgoing", 0)));
    }

    // 3. Active orders
    List<LogisticsOrder> orgOrders = orders.findAllByOrganization(org);
    List<Map<String, Object>> relatedOrders = orgOrders.stream()
        .filter(o -> matchesAny(o.origin != null ? o.origin.toLowerCase() : "", keywords)
                  || matchesAny(o.destination != null ? o.destination.toLowerCase() : "", keywords))
        .map(o -> map(
            "id", o.orderId,
            "customer", o.customer != null ? o.customer.name : "Unknown",
            "origin", o.origin,
            "destination", o.destination,
            "status", o.status,
            "cargo", o.cargo,
            "eta", o.eta
        )).toList();
    dto.put("activeOrders", relatedOrders);

    return dto;
  }

  private boolean matchesAny(String text, List<String> keywords) {
    if (text == null || text.isBlank()) return false;
    for (String kw : keywords) {
      if (text.contains(kw) || kw.contains(text)) return true;
    }
    return false;
  }

  private Map<String, Object> inventoryDto(InventoryItem item) {
    String sku = item.product != null ? item.product.sku : "N/A";
    String prodName = item.product != null ? item.product.name : "Unknown Item";
    String category = item.product != null ? item.product.category : "General";
    String unit = item.product != null && item.product.unit != null ? item.product.unit : "units";
    Double price = item.product != null && item.product.price != null ? item.product.price : 0.0;
    Long prodId = item.product != null ? item.product.id : null;

    String whName = item.warehouse != null ? item.warehouse.name : "Unassigned";
    String whCode = item.warehouse != null ? item.warehouse.warehouseCode : "";
    Long whId = item.warehouse != null ? item.warehouse.id : null;
    int avail = item.available();
    String status = avail <= 0 ? "Out of Stock" : avail <= (item.reorderLevel != null ? item.reorderLevel : 0) ? "Low Stock" : "In Stock";

    return map(
        "id", item.id != null ? item.id.toString() : sku,
        "itemId", item.id,
        "sku", sku,
        "productId", prodId,
        "product", prodName,
        "category", category,
        "unit", unit,
        "price", price,
        "warehouse", whName,
        "warehouseCode", whCode,
        "warehouseId", whId,
        "quantity", item.quantity != null ? item.quantity : 0,
        "reserved", item.reserved != null ? item.reserved : 0,
        "available", item.available(),
        "reorderLevel", item.reorderLevel != null ? item.reorderLevel : 0,
        "status", status
    );
  }

  private Map<String, Object> productDto(Product p) {
    Organization org = p.organization;
    List<InventoryItem> items = org != null ? inventory.findByProductAndOrganization(p, org) : List.of();
    int totalQty = items.stream().mapToInt(i -> i.quantity != null ? i.quantity : 0).sum();
    int totalReserved = items.stream().mapToInt(i -> i.reserved != null ? i.reserved : 0).sum();
    int totalAvailable = items.stream().mapToInt(InventoryItem::available).sum();
    int warehousesCount = (int) items.stream().map(i -> i.warehouse != null ? i.warehouse.id : null).filter(Objects::nonNull).distinct().count();

    return map(
        "id", p.sku,
        "productId", p.id,
        "sku", p.sku,
        "name", p.name,
        "category", p.category != null ? p.category : "General",
        "description", p.description != null ? p.description : "",
        "unit", p.unit != null ? p.unit : "units",
        "price", p.price != null ? p.price : 0.0,
        "status", p.status != null ? p.status : "Active",
        "totalQuantity", totalQty,
        "totalReserved", totalReserved,
        "totalAvailable", totalAvailable,
        "warehousesCount", warehousesCount
    );
  }

  private Map<String, Object> productDetailDto(Product p) {
    Map<String, Object> dto = new LinkedHashMap<>(productDto(p));
    Organization org = p.organization;
    List<InventoryItem> items = org != null ? inventory.findByProductAndOrganization(p, org) : List.of();
    List<Map<String, Object>> invList = items.stream().map(this::inventoryDto).toList();
    dto.put("inventory", invList);
    return dto;
  }

  private void syncWarehouseStock(Warehouse wh, Organization org) {
    if (wh == null || org == null) return;
    List<InventoryItem> whItems = inventory.findByWarehouseAndOrganization(wh, org);
    int totalStock = whItems.stream().mapToInt(i -> i.quantity != null ? i.quantity : 0).sum();
    wh.inventoryCount = totalStock;
    warehouses.save(wh);
  }

  private Map<String, Object> notificationDto(Notification notification) {
    return map("id", notification.notificationId, "title", notification.title, "description", notification.description,
        "priority", notification.priority, "type", notification.type, "time", notification.displayTime, "read", notification.readFlag);
  }

  private Map<String, Object> trackingVehicleDto(Vehicle vehicle, TrackingEvent event) {
    int load = vehicle.currentLoad == null ? 0 : vehicle.currentLoad;
    String trackingStatus = event == null ? vehicle.status : event.status;
    String driverName = vehicle.driver == null ? "Unassigned" : vehicle.driver.name;
    String driverId = vehicle.driver == null ? "" : vehicle.driver.driverId;

    String activeShipmentId = "";
    String activeOrderId = "";
    if (vehicle.organization != null) {
      Optional<Shipment> sOpt = shipments.findAllByOrganization(vehicle.organization).stream()
          .filter(s -> s.vehicle != null && Objects.equals(s.vehicle.id, vehicle.id) && !"Delivered".equalsIgnoreCase(s.status) && !"Cancelled".equalsIgnoreCase(s.status))
          .findFirst();
      if (sOpt.isPresent()) {
        activeShipmentId = sOpt.get().shipmentId;
        if (sOpt.get().order != null) activeOrderId = sOpt.get().order.orderId;
      }
    }

    String origin = routeOrigin(vehicle.route);
    String destination = routeDestination(vehicle.route);
    if ("Unassigned".equalsIgnoreCase(origin) && !activeShipmentId.isBlank() && vehicle.organization != null) {
      Shipment s = shipments.findByShipmentIdAndOrganization(activeShipmentId, vehicle.organization).orElse(null);
      if (s != null && s.order != null) {
        origin = s.order.origin != null ? s.order.origin : origin;
        destination = s.order.destination != null ? s.order.destination : destination;
      }
    }

    String location = (event != null && event.location != null && !event.location.isBlank()) ? event.location : (vehicle.location != null ? vehicle.location : "En route");
    String speed = event != null && event.speed != null ? event.speed : ("Offline".equals(vehicle.status) ? "Offline" : "0 km/h");
    String eta = event != null && event.eta != null ? event.eta : "Ready";
    int posX = event != null && event.mapX != null ? event.mapX : 25;
    int posY = event != null && event.mapY != null ? event.mapY : 38;
    int destX = event != null && event.destinationX != null ? event.destinationX : 68;
    int destY = event != null && event.destinationY != null ? event.destinationY : 58;
    int angle = event != null && event.routeAngle != null ? event.routeAngle : 18;
    int len = event != null && event.routeLength != null ? event.routeLength : 180;

    Double lat = (event != null && event.latitude != null) ? event.latitude : vehicle.currentLat;
    Double lng = (event != null && event.longitude != null) ? event.longitude : vehicle.currentLng;
    if (lat == null || lng == null) {
      lat = 17.3850;
      lng = 78.4867;
    }

    RoutePlan assignedRoute = null;
    if (vehicle.organization != null) {
      assignedRoute = routes.findAllByOrganization(vehicle.organization).stream()
          .filter(r -> r.vehicle != null && Objects.equals(r.vehicle.id, vehicle.id))
          .findFirst().orElse(null);
    }

    return map(
        "id", vehicle.vehicleId,
        "vehicleId", vehicle.vehicleId,
        "registration", vehicle.registration == null ? "" : vehicle.registration,
        "status", trackingStatus,
        "driver", driverName,
        "driverId", driverId,
        "speed", speed,
        "eta", eta,
        "cargo", load + "% capacity",
        "currentLoad", load,
        "location", location,
        "latitude", lat,
        "longitude", lng,
        "activeShipment", activeShipmentId,
        "activeOrder", activeOrderId,
        "route", vehicle.route == null ? "Unassigned" : vehicle.route,
        "assignedRouteId", assignedRoute != null ? assignedRoute.routeId : "",
        "routeGeometry", (assignedRoute != null && assignedRoute.routeGeometry != null) ? assignedRoute.routeGeometry : "",
        "routeOriginLat", assignedRoute != null ? assignedRoute.originLat : null,
        "routeOriginLng", assignedRoute != null ? assignedRoute.originLng : null,
        "routeDestLat", assignedRoute != null ? assignedRoute.destinationLat : null,
        "routeDestLng", assignedRoute != null ? assignedRoute.destinationLng : null,
        "origin", origin,
        "destination", destination,
        "position", map("x", posX, "y", posY),
        "destinationPos", map("x", destX, "y", destY),
        "routeAngle", angle,
        "routeLength", len,
        "lastUpdated", event != null ? event.timestamp.toString() : (vehicle.lastUpdated != null ? vehicle.lastUpdated : "Just now")
    );
  }

  private Map<String, Object> trackingEventDto(TrackingEvent event) {
    String shipmentId = event.shipment != null ? event.shipment.shipmentId : "";
    String orderId = (event.shipment != null && event.shipment.order != null) ? event.shipment.order.orderId : "";
    String vehicleId = event.vehicle != null ? event.vehicle.vehicleId : "";
    String driverName = (event.vehicle != null && event.vehicle.driver != null) ? event.vehicle.driver.name :
        (event.shipment != null && event.shipment.driver != null ? event.shipment.driver.name : "Unassigned");

    return map(
        "id", event.id,
        "shipmentId", shipmentId,
        "orderId", orderId,
        "vehicleId", vehicleId,
        "driver", driverName,
        "location", event.location != null ? event.location : "En route",
        "latitude", event.latitude != null ? event.latitude : 0.0,
        "longitude", event.longitude != null ? event.longitude : 0.0,
        "mapX", event.mapX != null ? event.mapX : 25,
        "mapY", event.mapY != null ? event.mapY : 38,
        "timestamp", event.timestamp != null ? event.timestamp.toString() : Instant.now().toString(),
        "status", event.status != null ? event.status : "In Transit",
        "speed", event.speed != null ? event.speed : "0 km/h",
        "eta", event.eta != null ? event.eta : "N/A"
    );
  }

  private String routeOrigin(String route) {
    if (route == null || !route.contains("->")) return "Unassigned";
    return route.split("->")[0].trim();
  }

  private String routeDestination(String route) {
    if (route == null || !route.contains("->")) return "Unassigned";
    return route.split("->")[1].trim();
  }

  public static Map<String, Object> map(Object... values) {
    Map<String, Object> map = new LinkedHashMap<>();
    for (int i = 0; i < values.length; i += 2) map.put(String.valueOf(values[i]), values[i + 1]);
    return map;
  }

  private static String string(Object value) {
    return value == null ? "" : String.valueOf(value);
  }

  private static int parseInt(Object value, int def) {
    if (value == null) return def;
    try {
      return Integer.parseInt(String.valueOf(value).replaceAll("[^0-9-]", ""));
    } catch (Exception ex) {
      return def;
    }
  }

  private static double parseDouble(Object value, double def) {
    if (value == null) return def;
    try {
      return Double.parseDouble(String.valueOf(value).replaceAll("[^0-9.-]", ""));
    } catch (Exception ex) {
      return def;
    }
  }

  private static Double parseDoubleObj(Object value) {
    if (value == null) return null;
    try {
      return Double.parseDouble(String.valueOf(value).replaceAll("[^0-9.-]", ""));
    } catch (Exception ex) {
      return null;
    }
  }

  private static Optional<Long> parseLong(String value) {
    try {
      return Optional.of(Long.parseLong(value));
    } catch (NumberFormatException ex) {
      return Optional.empty();
    }
  }

  private String nextOrderCode() {
    long max = 10481;
    for (LogisticsOrder o : orders.findAll()) {
      if (o.orderId != null && o.orderId.startsWith("LG-")) {
        try {
          long num = Long.parseLong(o.orderId.substring(3).trim());
          if (num > max) max = num;
        } catch (Exception ignored) {}
      }
    }
    return "LG-" + (max + 1);
  }

  private String nextShipmentCode() {
    long max = 78325;
    for (Shipment s : shipments.findAll()) {
      if (s.shipmentId != null && s.shipmentId.startsWith("SHP-")) {
        try {
          long num = Long.parseLong(s.shipmentId.substring(4).trim());
          if (num > max) max = num;
        } catch (Exception ignored) {}
      }
    }
    return "SHP-" + (max + 1);
  }

  private String nextVehicleCode() {
    long max = 400;
    for (Vehicle v : vehicles.findAll()) {
      if (v.vehicleId != null && v.vehicleId.startsWith("TRK-")) {
        try {
          long num = Long.parseLong(v.vehicleId.substring(4).trim());
          if (num > max) max = num;
        } catch (Exception ignored) {}
      }
    }
    return "TRK-" + (max + 1);
  }

  private String nextDriverCode() {
    long max = 133;
    for (Driver d : drivers.findAll()) {
      if (d.driverId != null && d.driverId.startsWith("DRV-")) {
        try {
          long num = Long.parseLong(d.driverId.substring(4).trim());
          if (num > max) max = num;
        } catch (Exception ignored) {}
      }
    }
    return String.format(Locale.US, "DRV-%03d", max + 1);
  }

  private String nextRouteCode() {
    long max = 9022;
    for (RoutePlan r : routes.findAll()) {
      if (r.routeId != null && r.routeId.startsWith("RTE-")) {
        try {
          long num = Long.parseLong(r.routeId.substring(4).trim());
          if (num > max) max = num;
        } catch (Exception ignored) {}
      }
    }
    return "RTE-" + (max + 1);
  }

  private String nextWarehouseCode() {
    long max = 100;
    for (Warehouse w : warehouses.findAll()) {
      if (w.warehouseCode != null && w.warehouseCode.startsWith("WH-")) {
        try {
          String suffix = w.warehouseCode.replaceAll("^WH-", "").replaceAll("\\D+", "");
          if (!suffix.isBlank()) {
            long num = Long.parseLong(suffix);
            if (num > max) max = num;
          }
        } catch (Exception ignored) {}
      }
    }
    return String.format(Locale.US, "WH-%03d", max + 1);
  }

  private Integer integer(Object value, Integer fallback) {
    if (value == null) return fallback;
    if (value instanceof Number n) return n.intValue();
    try {
      String s = value.toString().replaceAll("[^0-9-]", "").trim();
      return s.isBlank() ? fallback : Integer.parseInt(s);
    } catch (Exception e) {
      return fallback;
    }
  }

  private Double parseDouble(Object value, Double fallback) {
    if (value == null) return fallback;
    if (value instanceof Number n) return n.doubleValue();
    try {
      String s = value.toString().replaceAll("[^0-9.-]", "").trim();
      return s.isBlank() ? fallback : Double.parseDouble(s);
    } catch (Exception e) {
      return fallback;
    }
  }

  private String nextProductSku() {
    long max = 1000;
    for (Product p : products.findAll()) {
      if (p.sku != null && p.sku.startsWith("SKU-")) {
        try {
          String suffix = p.sku.replaceAll("^SKU-[A-Za-z]+-", "").replaceAll("\\D+", "");
          if (!suffix.isBlank()) {
            long num = Long.parseLong(suffix);
            if (num > max) max = num;
          }
        } catch (Exception ignored) {}
      }
    }
    return String.format(Locale.US, "SKU-GEN-%04d", max + 1);
  }

  public void logActivity(String action, String entityType, String entityId, String description) {
    try {
      Organization org = tenantContext.getCurrentOrganization();
      AppUser user = null;
      try { user = tenantContext.getCurrentUser(); } catch (Exception ignored) {}
      activityLogs.save(new ActivityLog(user, org, action, entityType, entityId, description));
    } catch (Exception ignored) {}
  }

  public void notifyOperationalEvent(String title, String description, String type, String priority) {
    try {
      Organization org = tenantContext.getCurrentOrganization();
      AppUser user = null;
      try { user = tenantContext.getCurrentUser(); } catch (Exception ignored) {}
      Notification n = new Notification();
      n.organization = org;
      n.user = user;
      n.notificationId = "NOTIF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
      n.title = title;
      n.description = description;
      n.type = type != null ? type : "Operational";
      n.priority = priority != null ? priority : "Medium";
      n.displayTime = "Just now";
      n.readFlag = false;
      n.createdAt = java.time.Instant.now();
      notifications.save(n);
    } catch (Exception ignored) {}
  }
}
