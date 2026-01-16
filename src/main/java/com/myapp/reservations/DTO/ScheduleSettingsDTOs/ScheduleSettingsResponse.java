package com.myapp.reservations.DTO.ScheduleSettingsDTOs;

import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayResponse;
import com.myapp.reservations.entities.Reservation.ReservationType;

import java.util.List;
import java.util.UUID;

public record ScheduleSettingsResponse(
        UUID id,
        ReservationType reservationType,
        Integer slotDurationValue,
        java.time.temporal.ChronoUnit slotDurationUnit,
        Integer minAdvanceBookingHours,
        Integer maxAdvanceBookingDays,
        Boolean autoConfirmAppointments,
        List<WorkingDayResponse> workingDays
) {}