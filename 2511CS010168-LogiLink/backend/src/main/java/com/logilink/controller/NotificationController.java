package com.logilink.controller;

import com.logilink.service.NotificationService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService notifications;

  public NotificationController(NotificationService notifications) {
    this.notifications = notifications;
  }

  @GetMapping
  public List<Map<String, Object>> list(
      @RequestParam(required = false) Boolean unreadOnly,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String search) {
    return notifications.list(unreadOnly, type, search);
  }

  @GetMapping("/unread-count")
  public Map<String, Object> unreadCount() {
    return notifications.unreadCount();
  }

  @GetMapping("/{id}")
  public Map<String, Object> getById(@PathVariable String id) {
    return notifications.getById(id);
  }

  @PatchMapping("/{id}/read")
  public Map<String, Object> markRead(@PathVariable String id) {
    return notifications.markRead(id);
  }

  @PatchMapping("/read-all")
  public Map<String, Object> markAllRead() {
    return notifications.markAllRead();
  }

  @DeleteMapping("/{id}")
  public Map<String, Object> delete(@PathVariable String id) {
    return notifications.delete(id);
  }

  @PostMapping
  public Map<String, Object> create(@RequestBody Map<String, Object> body) {
    String title = body.getOrDefault("title", "Operational Notice").toString();
    String description = body.getOrDefault("description", "").toString();
    String type = body.getOrDefault("type", "Operational").toString();
    String priority = body.getOrDefault("priority", "Medium").toString();
    return notifications.toDto(notifications.create(title, description, type, priority));
  }
}
