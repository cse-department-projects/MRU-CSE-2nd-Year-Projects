package com.logilink.service.geo;

import java.util.List;

public interface RoutingService {
  RouteResult calculateRoute(GeoLocation origin, GeoLocation destination, List<GeoLocation> stops);
  RouteResult optimizeRoute(GeoLocation origin, GeoLocation destination, List<GeoLocation> stops);
}
