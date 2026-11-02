package com.logilink.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tracking_events", indexes = {
    @Index(name = "idx_tracking_shipment_time", columnList = "shipment_id,timestamp"),
    @Index(name = "idx_tracking_events_org", columnList = "organization_id")
})
public class TrackingEvent {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", nullable = true)
  public Organization organization;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "shipment_id")
  public Shipment shipment;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vehicle_id")
  public Vehicle vehicle;

  public Double latitude;
  public Double longitude;
  public Integer mapX;
  public Integer mapY;
  public Integer destinationX;
  public Integer destinationY;
  public Integer routeAngle;
  public Integer routeLength;
  public String speed;
  public String status;
  public String eta;
  public String location;

  @Column(nullable = false)
  public Instant timestamp = Instant.now();

  public TrackingEvent() {}
}
