package com.resqnet.service;

import com.resqnet.dto.notification.NotificationResponse;
import com.resqnet.entity.User;
import com.resqnet.enums.NotificationType;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getUserNotifications(String email);
    long getUnreadCount(String email);
    NotificationResponse markAsRead(Long notificationId, String email);
    void markAllAsRead(String email);
    void sendNotification(User user, String title, String message, NotificationType type, String linkUrl);
}
