package com.logilink.config;

import com.logilink.entity.*;
import com.logilink.repository.*;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataSeeder {
  @Bean
  SeedRunner seedRunner(@Value("${logilink.seed.enabled}") boolean enabled, PasswordEncoder encoder, AppUserRepository users,
      OrganizationRepository organizations, CustomerRepository customers, DriverRepository drivers, VehicleRepository vehicles,
      RoutePlanRepository routes, ProductRepository products, WarehouseRepository warehouses, InventoryItemRepository inventory,
      LogisticsOrderRepository orders, ShipmentRepository shipments, TrackingEventRepository tracking,
      NotificationRepository notifications, ActivityLogRepository logs) {
    return new SeedRunner(enabled, encoder, users, organizations, customers, drivers, vehicles, routes, products, warehouses, inventory, orders, shipments, tracking, notifications, logs);
  }

  @Bean
  CommandLineRunner seedData(SeedRunner runner) {
    return args -> runner.seed();
  }

  static class SeedRunner {
    private final boolean enabled;
    private final PasswordEncoder encoder;
    private final AppUserRepository users;
    private final OrganizationRepository organizations;
    private final CustomerRepository customers;
    private final DriverRepository drivers;
    private final VehicleRepository vehicles;
    private final RoutePlanRepository routes;
    private final ProductRepository products;
    private final WarehouseRepository warehouses;
    private final InventoryItemRepository inventory;
    private final LogisticsOrderRepository orders;
    private final ShipmentRepository shipments;
    private final TrackingEventRepository tracking;
    private final NotificationRepository notifications;
    private final ActivityLogRepository logs;

    SeedRunner(@Value("${logilink.seed.enabled}") boolean enabled, PasswordEncoder encoder, AppUserRepository users,
        OrganizationRepository organizations, CustomerRepository customers, DriverRepository drivers, VehicleRepository vehicles,
        RoutePlanRepository routes, ProductRepository products, WarehouseRepository warehouses, InventoryItemRepository inventory,
        LogisticsOrderRepository orders, ShipmentRepository shipments, TrackingEventRepository tracking,
        NotificationRepository notifications, ActivityLogRepository logs) {
      this.enabled = enabled;
      this.encoder = encoder;
      this.users = users;
      this.organizations = organizations;
      this.customers = customers;
      this.drivers = drivers;
      this.vehicles = vehicles;
      this.routes = routes;
      this.products = products;
      this.warehouses = warehouses;
      this.inventory = inventory;
      this.orders = orders;
      this.shipments = shipments;
      this.tracking = tracking;
      this.notifications = notifications;
      this.logs = logs;
    }

    @Transactional
    public void seed() {
      if (!enabled || users.count() > 0) return;

      Organization demo = organizations.findByCode("DEMO").orElseGet(() ->
          organizations.save(new Organization("DEMO", "LogiLink Demo Organization", OrganizationType.COMPANY, OrganizationStatus.ACTIVE, "demo@logilink.edu", "+91 40 2345 6789", "LogiLink Global HQ, Hyderabad"))
      );

      AppUser admin = users.save(new AppUser("Kavya Menon", "admin@logilink.edu", encoder.encode("LogiLink@123"), UserRole.ADMIN, demo));
      users.save(new AppUser("Rohan Nair", "manager@logilink.edu", encoder.encode("LogiLink@123"), UserRole.MANAGER, demo));
      users.save(new AppUser("Isha Rao", "operator@logilink.edu", encoder.encode("LogiLink@123"), UserRole.OPERATOR, demo));

      Driver ahmed = driver("DRV-081", "Ahmed Khan", "+91 90000 78121", "On Trip", 214, 97.8, 4.8, "Hyderabad", demo);
      Driver meera = driver("DRV-094", "Meera Iyer", "+91 98450 55117", "On Trip", 188, 96.5, 4.7, "Bengaluru", demo);
      Driver ravi = driver("DRV-102", "Ravi Teja", "+91 97000 46382", "Available", 156, 98.1, 4.9, "Warangal", demo);
      Driver sana = driver("DRV-117", "Sana Shaikh", "+91 93444 81024", "On Trip", 203, 95.9, 4.6, "Chennai", demo);
      Driver vikram = driver("DRV-121", "Vikram Singh", "+91 98110 37825", "Available", 244, 97.2, 4.8, "Delhi", demo);
      driver("DRV-129", "Neha Patil", "+91 98670 45816", "Off Duty", 121, 94.8, 4.5, "Pune", demo);
      driver("DRV-133", "Prakash Reddy", "+91 99890 20491", "Suspended", 73, 89.4, 3.9, "Hyderabad", demo);

      Vehicle trk204 = vehicle("TRK-204", "TS09 FG 4204", "Container Truck", "18 t", 18, 82, ahmed, "In Transit", "Near Suryapet", "5 min ago", "Clear", "Hyderabad -> Vijayawada", 86, demo);
      Vehicle trk102 = vehicle("TRK-102", "TN10 CR 9102", "Heavy Truck", "22 t", 22, 67, sana, "In Transit", "Nellore corridor", "8 min ago", "Clear", "Chennai -> Hyderabad", 74, demo);
      Vehicle ref118 = vehicle("REF-118", "KA05 RX 7118", "Reefer Truck", "10 t", 10, 91, meera, "Delayed", "Krishnagiri checkpoint", "12 min ago", "Temperature alert reviewed", "Bengaluru -> Chennai", 92, demo);
      Vehicle lcv062 = vehicle("LCV-062", "TS03 LV 8062", "Light Commercial", "7 t", 7, 35, ravi, "Available", "Hyderabad Central Yard", "18 min ago", "Clear", "Unassigned", 55, demo);
      Vehicle trk311 = vehicle("TRK-311", "MH12 LK 2311", "Flatbed Truck", "20 t", 20, 0, null, "Maintenance", "Pune Service Bay", "1 hr ago", "Brake inspection", "Unassigned", 62, demo);
      vehicle("REF-209", "AP31 RF 6209", "Reefer Truck", "12 t", 12, 0, null, "Available", "Vishakhapatnam Hub", "24 min ago", "Clear", "Unassigned", 49, demo);
      Vehicle trk188 = vehicle("TRK-188", "DL01 XT 5188", "Container Truck", "16 t", 16, 42, vikram, "Idle", "Delhi North Hub", "31 min ago", "Clear", "Delhi -> Jaipur", 58, demo);

      Warehouse hyd = warehouse("WH-HYD-CEN", "Hyderabad Central", "Shamshabad, Hyderabad", "42,000 sq ft", 84, 12840, "Active", 18, 27, demo);
      Warehouse blr = warehouse("WH-BLR-NEL", "Bengaluru Nelamangala", "Nelamangala, Bengaluru", "36,500 sq ft", 76, 9210, "Active", 14, 19, demo);
      Warehouse chn = warehouse("WH-CHN-SR", "Chennai Sriperumbudur", "Sriperumbudur, Chennai", "39,200 sq ft", 69, 10344, "Active", 11, 23, demo);
      Warehouse pun = warehouse("WH-PUN-CH", "Pune Chakan", "Chakan MIDC, Pune", "28,800 sq ft", 92, 8112, "High Occupancy", 21, 16, demo);

      inventory(product("SKU-FMCG-2041", "Packaged grocery cartons", "FMCG", demo), hyd, 4200, 860, 900, demo);
      inventory(product("SKU-CLD-1180", "Cold-chain medicine crate", "Pharma", demo), blr, 480, 350, 220, demo);
      inventory(product("SKU-AUTO-7843", "Engine assembly set", "Automotive", demo), pun, 0, 0, 80, demo);
      inventory(product("SKU-TEX-5520", "Cotton fabric roll", "Textiles", demo), warehouses.save(warehouse("WH-DEL-NH", "Delhi North Hub", "North Delhi", "31,000 sq ft", 72, 6480, "Active", 8, 13, demo)), 1220, 240, 300, demo);
      inventory(product("SKU-APP-3301", "Mixer grinder carton", "Appliances", demo), chn, 710, 615, 140, demo);
      inventory(product("SKU-AGR-9184", "Hybrid seed bag", "Agriculture", demo), hyd, 2850, 400, 600, demo);

      RoutePlan r1 = route("RTE-9021", "Hyderabad", "Vijayawada", "Suryapet, Nandigama", trk204, "276 km", "5h 05m", "74 L", "Active", demo);
      RoutePlan r2 = route("RTE-9022", "Bengaluru", "Chennai", "Krishnagiri, Vellore", ref118, "348 km", "6h 40m", "96 L", "Delayed", demo);
      route("RTE-9023", "Chennai", "Hyderabad", "Nellore, Ongole, Vijayawada", trk102, "626 km", "11h 25m", "168 L", "Planned", demo);

      LogisticsOrder o1 = order("LG-10482", customer("Aarav Retail Distribution", "+91 98490 12044", "ops@aaravretail.in", demo), "Hyderabad", "Vijayawada", "FMCG cartons", "8.4 t", "Express", "In Transit", trk204, ahmed, "Today 14:35", LocalDate.of(2026, 8, 7), demo);
      LogisticsOrder o2 = order("LG-10483", customer("Nandi Pharma Logistics", "+91 98851 77420", "dispatch+nandi@logimail.in", demo), "Bengaluru", "Chennai", "Cold-chain medicines", "4.1 t", "Critical", "Delayed", ref118, meera, "Today 18:10", LocalDate.of(2026, 8, 7), demo);
      LogisticsOrder o3 = order("LG-10484", customer("Dakshin Auto Components", "+91 90102 44661", "logistics@dakshinauto.in", demo), "Pune", "Mumbai", "Engine assemblies", "12.8 t", "Standard", "Pending", trk311, null, "Tomorrow 09:30", LocalDate.of(2026, 8, 8), demo);
      LogisticsOrder o4 = order("LG-10485", customer("Krishna Agri Supply", "+91 97011 22294", "shipments@krishnaagri.in", demo), "Warangal", "Hyderabad", "Seed bags", "6.7 t", "Standard", "Delivered", lcv062, ravi, "Delivered 10:15", LocalDate.of(2026, 8, 6), demo);
      LogisticsOrder o5 = order("LG-10486", customer("Eastern Grid Appliances", "+91 99490 45812", "warehouse@egappliances.in", demo), "Chennai", "Hyderabad", "Consumer appliances", "15.2 t", "High", "Dispatched", trk102, sana, "Tomorrow 16:20", LocalDate.of(2026, 8, 8), demo);
      LogisticsOrder o6 = order("LG-10487", customer("Northline Textiles", "+91 98718 52250", "orders@northlinetex.in", demo), "Delhi", "Jaipur", "Fabric rolls", "5.9 t", "Standard", "Confirmed", trk188, vikram, "Tomorrow 12:00", LocalDate.of(2026, 8, 8), demo);
      order("LG-10488", customer("Coastal Foods Export", "+91 98404 77119", "dispatch@coastalfoods.in", demo), "Vishakhapatnam", "Hyderabad", "Frozen seafood", "7.3 t", "Critical", "Confirmed", null, null, "Tomorrow 21:40", LocalDate.of(2026, 8, 8), demo);
      order("LG-10489", customer("Metro BuildMart", "+91 98333 11540", "logistics@metrobuildmart.in", demo), "Mumbai", "Pune", "Construction tools", "9.6 t", "Standard", "Cancelled", null, null, "Cancelled", LocalDate.of(2026, 8, 5), demo);

      Shipment s1 = shipment("SHP-78321", o1, trk204, ahmed, r1, "Suryapet Bypass", "In Transit", "Today 14:35", "In Transit", demo);
      Shipment s2 = shipment("SHP-78322", o2, ref118, meera, r2, "Krishnagiri checkpoint", "Delayed", "Today 18:10", "Picked Up", demo);
      shipment("SHP-78323", o4, lcv062, ravi, null, "Hyderabad Central", "Delivered", "Delivered 10:15", "Delivered", demo);
      shipment("SHP-78324", o5, trk102, sana, null, "Nellore corridor", "Dispatched", "Tomorrow 16:20", "Dispatched", demo);
      shipment("SHP-78325", o6, trk188, vikram, null, "Delhi North Hub", "Confirmed", "Tomorrow 12:00", "Confirmed", demo);

      tracking(s1, trk204, 17.26, 79.34, 46, 43, 72, 60, 22, 240, "54 km/h", "In Transit", "14:35", demo);
      tracking(s2, ref118, 12.52, 78.21, 28, 65, 61, 82, 25, 210, "22 km/h", "Delayed", "18:10", demo);
      tracking(null, trk102, 14.44, 79.99, 62, 72, 35, 35, -132, 260, "61 km/h", "In Transit", "Tomorrow 16:20", demo);
      tracking(null, lcv062, 17.42, 78.39, 37, 31, 31, 38, 135, 90, "0 km/h", "Idle", "Ready", demo);
      tracking(null, trk311, 18.52, 73.85, 18, 45, 18, 45, 0, 0, "Offline", "Offline", "Maintenance", demo);

      notification("NTF-001", "Shipment SHP-78322 delayed", "Checkpoint congestion near Krishnagiri added 45 minutes.", "High", "Shipment delayed", "12 min ago", admin, demo);
      notification("NTF-002", "TRK-311 maintenance required", "Brake inspection is pending before next dispatch.", "Medium", "Vehicle maintenance", "1 hr ago", admin, demo);
      notification("NTF-003", "Low inventory for cold-chain crates", "Bengaluru Nelamangala has 130 available units.", "High", "Low inventory", "2 hrs ago", admin, demo);
      notification("NTF-004", "New order LG-10488 received", "Frozen seafood transfer from Vishakhapatnam to Hyderabad.", "Normal", "New order", "3 hrs ago", admin, demo);
      notification("NTF-005", "Delivery completed for LG-10485", "Warangal to Hyderabad shipment closed successfully.", "Normal", "Delivery completed", "Today 10:18", admin, demo);
      notification("NTF-006", "Route optimization available", "Chennai to Hyderabad route can save an estimated 55 km.", "Medium", "Route optimization", "Today 09:20", admin, demo);

      logs.save(new ActivityLog(admin, demo, "SEED_DATA_CREATED", "System", "development", "Initial LogiLink development data loaded."));
    }

    private Driver driver(String driverId, String name, String contact, String status, int trips, double success, double rating, String base, Organization org) {
      Driver d = new Driver();
      d.driverId = driverId; d.name = name; d.contact = contact; d.status = status; d.totalTrips = trips; d.successRate = success; d.rating = rating; d.base = base; d.organization = org;
      return drivers.save(d);
    }

    private Vehicle vehicle(String id, String registration, String type, String capacity, double capacityValue, int load, Driver driver, String status, String location, String updated, String maintenance, String route, int utilization, Organization org) {
      Vehicle v = new Vehicle();
      v.vehicleId = id; v.registration = registration; v.type = type; v.capacity = capacity; v.capacityValue = capacityValue; v.currentLoad = load; v.driver = driver; v.status = status; v.location = location; v.lastUpdated = updated; v.maintenance = maintenance; v.route = route; v.utilization = utilization; v.organization = org;
      return vehicles.save(v);
    }

    private Customer customer(String name, String contact, String email, Organization org) {
      return customers.save(new Customer(name, contact, email, org));
    }

    private Warehouse warehouse(String code, String name, String location, String capacity, int occupancy, int count, String status, int incoming, int outgoing, Organization org) {
      Warehouse w = new Warehouse();
      w.warehouseCode = code; w.name = name; w.location = location; w.capacity = capacity; w.occupancy = occupancy; w.inventoryCount = count; w.status = status; w.incoming = incoming; w.outgoing = outgoing; w.organization = org;
      return warehouses.save(w);
    }

    private Product product(String sku, String name, String category, Organization org) {
      Product p = new Product();
      p.sku = sku; p.name = name; p.category = category; p.organization = org;
      return products.save(p);
    }

    private InventoryItem inventory(Product product, Warehouse warehouse, int quantity, int reserved, int reorder, Organization org) {
      InventoryItem item = new InventoryItem();
      item.product = product; item.warehouse = warehouse; item.quantity = quantity; item.reserved = reserved; item.reorderLevel = reorder; item.organization = org;
      return inventory.save(item);
    }

    private RoutePlan route(String id, String origin, String destination, String stops, Vehicle vehicle, String distance, String time, String fuel, String status, Organization org) {
      RoutePlan r = new RoutePlan();
      r.routeId = id; r.origin = origin; r.destination = destination; r.stops = stops; r.vehicle = vehicle; r.distance = distance; r.estimatedTime = time; r.fuelEstimate = fuel; r.status = status; r.organization = org;
      return routes.save(r);
    }

    private LogisticsOrder order(String id, Customer customer, String origin, String destination, String cargo, String weight, String priority, String status, Vehicle vehicle, Driver driver, String eta, LocalDate created, Organization org) {
      LogisticsOrder o = new LogisticsOrder();
      o.orderId = id; o.customer = customer; o.origin = origin; o.destination = destination; o.cargo = cargo; o.weight = weight; o.priority = priority; o.status = status; o.vehicle = vehicle; o.driver = driver; o.eta = eta; o.createdDate = created;
      o.pickupDate = created;
      o.deliveryDate = created != null ? created.plusDays(1) : null;
      o.organization = org;
      return orders.save(o);
    }

    private Shipment shipment(String id, LogisticsOrder order, Vehicle vehicle, Driver driver, RoutePlan route, String location, String status, String eta, String stage, Organization org) {
      Shipment s = new Shipment();
      s.shipmentId = id; s.order = order; s.vehicle = vehicle; s.driver = driver; s.route = route; s.currentLocation = location; s.status = status; s.eta = eta; s.stage = stage; s.organization = org;
      return shipments.save(s);
    }

    private TrackingEvent tracking(Shipment shipment, Vehicle vehicle, double lat, double lon, int x, int y, int dx, int dy, int angle, int length, String speed, String status, String eta, Organization org) {
      TrackingEvent event = new TrackingEvent();
      event.shipment = shipment; event.vehicle = vehicle; event.latitude = lat; event.longitude = lon; event.mapX = x; event.mapY = y; event.destinationX = dx; event.destinationY = dy; event.routeAngle = angle; event.routeLength = length; event.speed = speed; event.status = status; event.eta = eta; event.organization = org;
      return tracking.save(event);
    }

    private Notification notification(String id, String title, String description, String priority, String type, String displayTime, AppUser user, Organization org) {
      Notification n = new Notification();
      n.notificationId = id; n.title = title; n.description = description; n.priority = priority; n.type = type; n.displayTime = displayTime; n.user = user; n.organization = org;
      return notifications.save(n);
    }
  }
}
