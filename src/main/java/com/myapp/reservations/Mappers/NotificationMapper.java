package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.NotificationDTOs.NotificationResponse;
import com.myapp.reservations.entities.Notification;

public class NotificationMapper {

    public static NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getTargetUrl(),
                notification.getCreatedAt()
        );
    }
}
