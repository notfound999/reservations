package com.myapp.reservations.DTO.ReservationDTOs;

import com.myapp.reservations.entities.BusinessSchedule.ReservationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID businessId,
        UUID offeringId,
        String offeringName, // e.g., "Main Office" or "Haircut"
        UUID userId,
        String userName,

        LocalDateTime startDateTime,
        LocalDateTime endDateTime,

        ReservationStatus status,
        LocalDateTime createdAt
) {}
