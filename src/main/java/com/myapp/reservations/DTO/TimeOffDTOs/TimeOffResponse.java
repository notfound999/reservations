package com.myapp.reservations.DTO.TimeOffDTOs;

import java.time.LocalDateTime;
import java.util.UUID;

public record TimeOffResponse(
        UUID id,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        String reason
) {
}
