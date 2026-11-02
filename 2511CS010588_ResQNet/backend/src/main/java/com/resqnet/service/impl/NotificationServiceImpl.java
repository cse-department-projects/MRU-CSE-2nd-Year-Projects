package com.resqnet.service.impl;

import com.resqnet.dto.notification.NotificationResponse;
import com.resqnet.entity.Notification;
import com.resqnet.entity.User;
import com.resqnet.enums.NotificationType;
import com.resqnet.exception.ResourceNotFoundException;
import com.resqnet.repository.NotificationRepository;
import com.resqnet.repository.UserRepository;
import com.resqnet.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return notifications.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification does not belong to the user.");
        }

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void sendNotification(User user, String title, String message, NotificationType type, String linkUrl) {
        if (user == null) return;
        Notification notification = new Notification(user, title, message, type, linkUrl);
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.setId(n.getId());
        res.setUserId(n.getUser().getId());
        res.setTitle(n.getTitle());
        res.setMessage(n.getMessage());
        res.setType(n.getType());
        res.setIsRead(n.getIsRead());
        res.setLinkUrl(n.getLinkUrl());
        res.setCreatedAt(n.getCreatedAt());
        return res;
    }
}
