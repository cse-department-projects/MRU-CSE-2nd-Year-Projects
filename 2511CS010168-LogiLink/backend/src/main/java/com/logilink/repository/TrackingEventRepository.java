package com.logilink.repository;

import com.logilink.entity.Organization;
import com.logilink.entity.Shipment;
import com.logilink.entity.TrackingEvent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
  List<TrackingEvent> findByShipmentOrderByTimestampDesc(Shipment shipment);
  Optional<TrackingEvent> findFirstByVehicleVehicleIdOrderByTimestampDesc(String vehicleId);
  List<TrackingEvent> findByShipmentAndOrganizationOrderByTimestampDesc(Shipment shipment, Organization organization);
  List<TrackingEvent> findByVehicleAndOrganizationOrderByTimestampDesc(com.logilink.entity.Vehicle vehicle, Organization organization);
  Optional<TrackingEvent> findFirstByVehicleVehicleIdAndOrganizationOrderByTimestampDesc(String vehicleId, Organization organization);
  Optional<TrackingEvent> findByIdAndOrganization(Long id, Organization organization);
  List<TrackingEvent> findAllByOrganization(Organization organization);
  List<TrackingEvent> findAllByOrganizationOrderByTimestampDesc(Organization organization);
}
