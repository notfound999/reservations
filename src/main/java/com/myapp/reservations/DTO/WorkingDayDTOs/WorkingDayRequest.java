package com.myapp.reservations.DTO.WorkingDayDTOs;

import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record WorkingDayRequest(
        @NotNull String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        LocalTime breakStartTime,
        LocalTime breakEndTime,
        boolean isDayOff
) {
}
