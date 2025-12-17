package com.myapp.reservations.DTO.ScheduleSettingsDTOs;

import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayResponse;

import java.util.List;
import java.util.UUID;

public record ScheduleSettingsResponse(
        UUID id,
        Integer minAdvanceBookingHours,
        Integer maxAdvanceBookingDays,
        Integer defaultSlotDurationMinutes,
        Boolean autoConfirmAppointments,
        List<WorkingDayResponse> workingDays
) {
}
