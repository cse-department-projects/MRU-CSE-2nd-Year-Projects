package com.logilink.controller;

import com.logilink.entity.ActivityLog;
import com.logilink.entity.Organization;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.ActivityLogRepository;
import com.logilink.security.TenantContext;
import com.logilink.service.OperationsService;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {
  private final ActivityLogRepository logs;
  private final TenantContext tenantContext;

  public ActivityLogController(ActivityLogRepository logs, TenantContext tenantContext) {
    this.logs = logs;
    this.tenantContext = tenantContext;
  }

  @GetMapping
  public List<Map<String, Object>> list(
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String entityType,
      @RequestParam(required = false) String search,
      @RequestParam(required = false, defaultValue = "100") Integer limit) {
    Organization org = tenantContext.getCurrentOrganization();
    List<ActivityLog> allLogs = logs.findAllByOrganizationOrderByTimestampDesc(org);

    String searchLower = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

    return allLogs.stream()
        .filter(l -> action == null || action.isBlank() || action.equalsIgnoreCase(l.action))
        .filter(l -> entityType == null || entityType.isBlank() || entityType.equalsIgnoreCase(l.entityType))
        .filter(l -> searchLower == null || matchesSearch(l, searchLower))
        .limit(limit != null && limit > 0 ? limit : 100)
        .map(this::toDto)
        .toList();
  }

  @GetMapping("/{id}")
  public Map<String, Object> getById(@PathVariable Long id) {
    Organization org = tenantContext.getCurrentOrganization();
    ActivityLog log = logs.findByIdAndOrganization(id, org)
        .orElseThrow(() -> new ResourceNotFoundException("Activity log not found: " + id));
    return toDto(log);
  }

  private boolean matchesSearch(ActivityLog l, String q) {
    if (l.description != null && l.description.toLowerCase().contains(q)) return true;
    if (l.action != null && l.action.toLowerCase().contains(q)) return true;
    if (l.entityType != null && l.entityType.toLowerCase().contains(q)) return true;
    if (l.entityId != null && l.entityId.toLowerCase().contains(q)) return true;
    if (l.user != null && l.user.name != null && l.user.name.toLowerCase().contains(q)) return true;
    if (l.user == null && "system".contains(q)) return true;
    return false;
  }

  private Map<String, Object> toDto(ActivityLog log) {
    String timeStr = formatRelativeTime(log.timestamp);
    String userName = log.user == null ? "System" : log.user.name;
    return OperationsService.map(
        "id", log.id,
        "user", userName,
        "userName", userName,
        "action", log.action != null ? log.action : "ACTION",
        "entity", log.entityType != null ? log.entityType : "System",
        "entityType", log.entityType != null ? log.entityType : "System",
        "entityId", log.entityId == null ? "" : log.entityId,
        "description", log.description != null ? log.description : "",
        "timestamp", log.timestamp != null ? log.timestamp.toString() : Instant.now().toString(),
        "time", timeStr,
        "relativeTime", timeStr);
  }

  private String formatRelativeTime(Instant instant) {
    if (instant == null) return "Just now";
    Duration d = Duration.between(instant, Instant.now());
    long seconds = d.getSeconds();
    if (seconds < 60) return "Just now";
    long minutes = seconds / 60;
    if (minutes < 60) return minutes + "m ago";
    long hours = minutes / 60;
    if (hours < 24) return hours + "h ago";
    long days = hours / 24;
    if (days < 7) return days + "d ago";
    return DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneId.systemDefault()).format(instant);
  }
}
