package com.logilink.service;

import com.logilink.entity.AppUser;
import com.logilink.entity.Notification;
import com.logilink.entity.Organization;
import com.logilink.exception.ResourceNotFoundException;
import com.logilink.repository.NotificationRepository;
import com.logilink.security.TenantContext;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {
  private final NotificationRepository notifications;
  private final TenantContext tenantContext;

  public NotificationService(NotificationRepository notifications, TenantContext tenantContext) {
    this.notifications = notifications;
    this.tenantContext = tenantContext;
  }

  public List<Map<String, Object>> list(Boolean unreadOnly, String type, String search) {
    Organization org = tenantContext.getCurrentOrganization();
    List<Notification> list = notifications.findAllByOrganizationOrderByCreatedAtDesc(org);

    String searchLower = (search != null && !search.isBlank()) ? search.trim().toLowerCase() : null;

    return list.stream()
        .filter(n -> unreadOnly == null || !unreadOnly || !n.readFlag)
        .filter(n -> type == null || type.isBlank() || "all".equalsIgnoreCase(type) || type.equalsIgnoreCase(n.type))
        .filter(n -> searchLower == null || matchesSearch(n, searchLower))
        .map(this::toDto)
        .toList();
  }

  private boolean matchesSearch(Notification n, String q) {
    if (n.title != null && n.title.toLowerCase().contains(q)) return true;
    if (n.description != null && n.description.toLowerCase().contains(q)) return true;
    if (n.type != null && n.type.toLowerCase().contains(q)) return true;
    if (n.priority != null && n.priority.toLowerCase().contains(q)) return true;
    if (n.notificationId != null && n.notificationId.toLowerCase().contains(q)) return true;
    return false;
  }

  public Notification findNotification(String id, Organization org) {
    if (id == null || id.isBlank()) throw new ResourceNotFoundException("Notification id required");
    Optional<Notification> n = notifications.findByNotificationIdAndOrganization(id, org);
    if (n.isPresent()) return n.get();
    try {
      long pk = Long.parseLong(id);
      return notifications.findByPkAndOrganization(pk, org)
          .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
    } catch (NumberFormatException ignored) {}
    throw new ResourceNotFoundException("Notification not found: " + id);
  }

  public Map<String, Object> getById(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    return toDto(findNotification(id, org));
  }

  @Transactional
  public Map<String, Object> markRead(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Notification notification = findNotification(id, org);
    notification.readFlag = true;
    return toDto(notifications.save(notification));
  }

  @Transactional
  public Map<String, Object> markAllRead() {
    Organization org = tenantContext.getCurrentOrganization();
    List<Notification> unread = notifications.findAllByOrganizationAndReadFlagFalse(org);
    for (Notification n : unread) {
      n.readFlag = true;
    }
    notifications.saveAll(unread);
    return OperationsService.map("markedRead", unread.size(), "updated", unread.size(), "success", true, "message", "All notifications marked as read.");
  }

  @Transactional
  public Map<String, Object> delete(String id) {
    Organization org = tenantContext.getCurrentOrganization();
    Notification notification = findNotification(id, org);
    notifications.delete(notification);
    return OperationsService.map("deleted", true, "id", id, "message", "Notification dismissed.");
  }

  public Map<String, Object> unreadCount() {
    Organization org = tenantContext.getCurrentOrganization();
    long count = notifications.countByOrganizationAndReadFlagFalse(org);
    return OperationsService.map("unreadCount", count, "count", count);
  }

  @Transactional
  public Notification create(String title, String description, String type, String priority) {
    Organization org = tenantContext.getCurrentOrganization();
    AppUser user = null;
    try {
      user = tenantContext.getCurrentUser();
    } catch (Exception ignored) {}

    Notification n = new Notification();
    n.organization = org;
    n.user = user;
    n.notificationId = "NOTIF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    n.title = title;
    n.description = description;
    n.type = (type != null && !type.isBlank()) ? type : "Operational";
    n.priority = (priority != null && !priority.isBlank()) ? priority : "Medium";
    n.displayTime = "Just now";
    n.readFlag = false;
    n.createdAt = Instant.now();
    return notifications.save(n);
  }

  public Map<String, Object> toDto(Notification n) {
    String timeStr = formatRelativeTime(n.createdAt);
    String id = (n.notificationId != null && !n.notificationId.isBlank()) ? n.notificationId : ("NOTIF-" + n.pk);
    return OperationsService.map(
        "id", id,
        "notificationId", id,
        "title", n.title != null ? n.title : "Notification",
        "description", n.description != null ? n.description : "",
        "priority", n.priority != null ? n.priority : "Medium",
        "type", n.type != null ? n.type : "Operational",
        "time", timeStr,
        "displayTime", timeStr,
        "relativeTime", timeStr,
        "read", n.readFlag,
        "readFlag", n.readFlag,
        "createdAt", n.createdAt != null ? n.createdAt.toString() : Instant.now().toString());
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
