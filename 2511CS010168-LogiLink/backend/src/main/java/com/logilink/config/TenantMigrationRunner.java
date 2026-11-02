package com.logilink.config;

import com.logilink.entity.*;
import com.logilink.repository.*;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class TenantMigrationRunner implements CommandLineRunner {
  private static final Logger log = LoggerFactory.getLogger(TenantMigrationRunner.class);

  private final OrganizationRepository organizations;
  private final AppUserRepository users;
  private final CustomerRepository customers;
  private final DriverRepository drivers;
  private final VehicleRepository vehicles;
  private final RoutePlanRepository routes;
  private final LogisticsOrderRepository orders;
  private final ShipmentRepository shipments;
  private final WarehouseRepository warehouses;
  private final ProductRepository products;
  private final InventoryItemRepository inventory;
  private final NotificationRepository notifications;
  private final ActivityLogRepository logsRepo;
  private final TrackingEventRepository trackingEvents;

  public TenantMigrationRunner(
      OrganizationRepository organizations,
      AppUserRepository users,
      CustomerRepository customers,
      DriverRepository drivers,
      VehicleRepository vehicles,
      RoutePlanRepository routes,
      LogisticsOrderRepository orders,
      ShipmentRepository shipments,
      WarehouseRepository warehouses,
      ProductRepository products,
      InventoryItemRepository inventory,
      NotificationRepository notifications,
      ActivityLogRepository logsRepo,
      TrackingEventRepository trackingEvents) {
    this.organizations = organizations;
    this.users = users;
    this.customers = customers;
    this.drivers = drivers;
    this.vehicles = vehicles;
    this.routes = routes;
    this.orders = orders;
    this.shipments = shipments;
    this.warehouses = warehouses;
    this.products = products;
    this.inventory = inventory;
    this.notifications = notifications;
    this.logsRepo = logsRepo;
    this.trackingEvents = trackingEvents;
  }

  @Override
  @Transactional
  public void run(String... args) {
    Organization demoOrg = organizations.findByCode("DEMO").orElseGet(() -> {
      log.info("Creating initial Demo Organization (code: DEMO)...");
      Organization org = new Organization(
          "DEMO",
          "LogiLink Demo Organization",
          OrganizationType.COMPANY,
          OrganizationStatus.ACTIVE,
          "demo@logilink.edu",
          "+91 40 2345 6789",
          "LogiLink Global HQ, Hyderabad"
      );
      return organizations.save(org);
    });

    // Safely associate existing users without organization
    for (AppUser user : users.findAll()) {
      if (user.organization == null) {
        user.organization = demoOrg;
        users.save(user);
        log.info("Assigned user {} to Demo Organization", user.email);
      }
    }

    // Safely associate existing operational records without organization
    customers.findAll().stream().filter(c -> c.organization == null).forEach(c -> { c.organization = demoOrg; customers.save(c); });
    drivers.findAll().stream().filter(d -> d.organization == null).forEach(d -> { d.organization = demoOrg; drivers.save(d); });
    vehicles.findAll().stream().filter(v -> v.organization == null).forEach(v -> { v.organization = demoOrg; vehicles.save(v); });
    routes.findAll().stream().filter(r -> r.organization == null).forEach(r -> { r.organization = demoOrg; routes.save(r); });
    orders.findAll().stream().filter(o -> o.organization == null).forEach(o -> { o.organization = demoOrg; orders.save(o); });
    shipments.findAll().stream().filter(s -> s.organization == null).forEach(s -> { s.organization = demoOrg; shipments.save(s); });
    warehouses.findAll().stream().filter(w -> w.organization == null).forEach(w -> { w.organization = demoOrg; warehouses.save(w); });
    products.findAll().stream().filter(p -> p.organization == null).forEach(p -> { p.organization = demoOrg; products.save(p); });
    inventory.findAll().stream().filter(i -> i.organization == null).forEach(i -> { i.organization = demoOrg; inventory.save(i); });
    notifications.findAll().stream().filter(n -> n.organization == null).forEach(n -> { n.organization = demoOrg; notifications.save(n); });
    logsRepo.findAll().stream().filter(l -> l.organization == null).forEach(l -> { l.organization = demoOrg; logsRepo.save(l); });
    trackingEvents.findAll().stream().filter(t -> t.organization == null).forEach(t -> { t.organization = demoOrg; trackingEvents.save(t); });

    // Populate initial coordinates for existing routes
    for (RoutePlan r : routes.findAll()) {
      boolean updated = false;
      if (r.originLat == null || r.originLng == null) {
        if ("Hyderabad".equalsIgnoreCase(r.origin)) { r.originLat = 17.3850; r.originLng = 78.4867; updated = true; }
        else if ("Bengaluru".equalsIgnoreCase(r.origin)) { r.originLat = 12.9716; r.originLng = 77.5946; updated = true; }
        else if ("Chennai".equalsIgnoreCase(r.origin)) { r.originLat = 13.0827; r.originLng = 80.2707; updated = true; }
        else if ("Mumbai".equalsIgnoreCase(r.origin)) { r.originLat = 19.0760; r.originLng = 72.8777; updated = true; }
        else if ("Delhi".equalsIgnoreCase(r.origin)) { r.originLat = 28.6139; r.originLng = 77.2090; updated = true; }
        else if ("Pune".equalsIgnoreCase(r.origin)) { r.originLat = 18.5204; r.originLng = 73.8567; updated = true; }
      }
      if (r.destinationLat == null || r.destinationLng == null) {
        if ("Vijayawada".equalsIgnoreCase(r.destination)) { r.destinationLat = 16.5062; r.destinationLng = 80.6480; updated = true; }
        else if ("Chennai".equalsIgnoreCase(r.destination)) { r.destinationLat = 13.0827; r.destinationLng = 80.2707; updated = true; }
        else if ("Hyderabad".equalsIgnoreCase(r.destination)) { r.destinationLat = 17.3850; r.destinationLng = 78.4867; updated = true; }
        else if ("Mumbai".equalsIgnoreCase(r.destination)) { r.destinationLat = 19.0760; r.destinationLng = 72.8777; updated = true; }
        else if ("Jaipur".equalsIgnoreCase(r.destination)) { r.destinationLat = 26.9124; r.destinationLng = 75.7873; updated = true; }
        else if ("Visakhapatnam".equalsIgnoreCase(r.destination) || "Vishakhapatnam".equalsIgnoreCase(r.destination)) { r.destinationLat = 17.6868; r.destinationLng = 83.2185; updated = true; }
      }
      if (updated) {
        routes.save(r);
      }
    }

    // Populate initial coordinates for vehicles from tracking events or city defaults
    for (Vehicle v : vehicles.findAll()) {
      if (v.currentLat == null || v.currentLng == null) {
        Optional<TrackingEvent> te = trackingEvents.findFirstByVehicleVehicleIdOrderByTimestampDesc(v.vehicleId);
        if (te.isPresent() && te.get().latitude != null) {
          v.currentLat = te.get().latitude;
          v.currentLng = te.get().longitude;
          vehicles.save(v);
        } else {
          v.currentLat = 17.3850;
          v.currentLng = 78.4867;
          vehicles.save(v);
        }
      }
    }

    log.info("Tenant migration complete. Demo Organization ID: {}", demoOrg.id);
  }
}
