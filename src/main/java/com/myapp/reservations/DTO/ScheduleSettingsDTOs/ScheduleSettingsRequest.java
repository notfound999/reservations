package com.myapp.reservations.DTO.ScheduleSettingsDTOs;

import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayRequest;
import jakarta.validation.constraints.Min;

import java.util.List;

public record ScheduleSettingsRequest(
        @Min(0) Integer minAdvanceBookingHours,
        @Min(1) Integer maxAdvanceBookingDays,
        @Min(5) Integer defaultSlotDurationMinutes,
        Boolean autoConfirmAppointments,
        // Sending the full list of days to update at once
        List<WorkingDayRequest> workingDays
) {
}
