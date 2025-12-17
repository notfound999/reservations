package com.myapp.reservations.DTO.WorkingDayDTOs;

import java.time.LocalTime;
import java.util.UUID;

public record WorkingDayResponse(
        UUID id,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        LocalTime breakStartTime,
        LocalTime breakEndTime,
        boolean isDayOff
) {
}
