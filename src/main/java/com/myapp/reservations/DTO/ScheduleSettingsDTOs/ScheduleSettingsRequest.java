package com.myapp.reservations.DTO.ScheduleSettingsDTOs;

import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayRequest;
import com.myapp.reservations.entities.BusinessSchedule.ReservationType;
import jakarta.validation.constraints.Min;

import java.util.List;

public record ScheduleSettingsRequest(
        ReservationType reservationType,
        @Min(1) Integer slotDurationValue,
        java.time.temporal.ChronoUnit slotDurationUnit, // e.g., MINUTES, HOURS, DAYS
        @Min(0) Integer minAdvanceBookingHours,
        @Min(1) Integer maxAdvanceBookingDays,
        Boolean autoConfirmAppointments,
        List<WorkingDayRequest> workingDays
) {}
