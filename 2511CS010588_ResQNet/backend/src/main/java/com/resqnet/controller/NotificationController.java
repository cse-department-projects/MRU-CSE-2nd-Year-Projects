package com.resqnet.controller;

import com.resqnet.dto.common.ApiResponse;
import com.resqnet.dto.notification.NotificationResponse;
import com.resqnet.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(Authentication authentication) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(notifications, "Notifications retrieved successfully"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        long count = notificationService.getUnreadCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(count, "Unread notification count"));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        NotificationResponse updated = notificationService.markAsRead(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(updated, "Notification marked as read"));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "All notifications marked as read"));
    }
}
