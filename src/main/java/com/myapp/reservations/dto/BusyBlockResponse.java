package com.myapp.reservations.dto;

import java.time.LocalDateTime;

public record BusyBlockResponse(
        LocalDateTime start,
        LocalDateTime end,
        String type // e.g., "OCCUPIED", "CLOSED", "MAINTENANCE"
) {}