package com.logilink.service.geo;

import com.logilink.entity.Organization;
import java.util.List;
import java.util.Optional;

public interface GeocodingService {
  List<GeoLocation> search(String query, Organization organization);
  Optional<GeoLocation> geocode(String locationName, Organization organization);
}
