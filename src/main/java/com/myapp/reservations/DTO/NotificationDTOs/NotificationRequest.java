package com.myapp.reservations.DTO.NotificationDTOs;

import com.myapp.reservations.entities.NotificationType;

import java.util.UUID;

public record NotificationRequest(
        UUID userId,
        String title,
        String message,
        NotificationType type,
        String targetUrl
) {
}
