package com.myapp.reservations.DTO.ReviewDTOs;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
        UUID id,
        UUID businessId,
        UUID userId,
        String userName,
        String userAvatar,
        Integer rating,
        String comment,
        LocalDateTime createdAt
) {
}
