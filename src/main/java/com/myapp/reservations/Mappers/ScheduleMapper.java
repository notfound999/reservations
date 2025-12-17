package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsRequest;
import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsResponse;
import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayRequest;
import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayResponse;
import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import com.myapp.reservations.entities.BusinessSchedule.WorkingDay;

import java.time.DayOfWeek;
import java.util.List;

public class ScheduleMapper {

    /**
     * Converts a ScheduleSettingsRequest into a ScheduleSettings Entity.
     * Name: toScheduleSettings
     */
    public static ScheduleSettings toScheduleSettings(ScheduleSettingsRequest request) {
        if (request == null) return null;

        ScheduleSettings settings = new ScheduleSettings();
        settings.setMinAdvanceBookingHours(request.minAdvanceBookingHours());
        settings.setMaxAdvanceBookingDays(request.maxAdvanceBookingDays());
        settings.setDefaultSlotDurationMinutes(request.defaultSlotDurationMinutes());
        settings.setAutoConfirmAppointments(request.autoConfirmAppointments());

        // Map the list of WorkingDayRequests into WorkingDay Entities
        if (request.workingDays() != null) {
            List<WorkingDay> days = request.workingDays().stream()
                    .map(dayRequest -> toWorkingDay(dayRequest, settings))
                    .toList();
            settings.setWorkingDays(days);
        }

        return settings;
    }

    /**
     * Converts a ScheduleSettings Entity into a ScheduleSettingsResponse.
     * Name: toResponse
     */
    public static ScheduleSettingsResponse toResponse(ScheduleSettings entity) {
        if (entity == null) return null;

        List<WorkingDayResponse> dayResponses = entity.getWorkingDays() != null
                ? entity.getWorkingDays().stream()
                .map(ScheduleMapper::toWorkingDayResponse)
                .toList()
                : List.of();

        return new ScheduleSettingsResponse(
                entity.getId(),
                entity.getMinAdvanceBookingHours(),
                entity.getMaxAdvanceBookingDays(),
                entity.getDefaultSlotDurationMinutes(),
                entity.getAutoConfirmAppointments(),
                dayResponses
        );
    }

    // --- Private Helper Methods for WorkingDay ---

    private static WorkingDay toWorkingDay(WorkingDayRequest request, ScheduleSettings settings) {
        WorkingDay day = new WorkingDay();
        day.setDayOfWeek(DayOfWeek.valueOf(request.dayOfWeek().toUpperCase()));
        day.setStartTime(request.startTime());
        day.setEndTime(request.endTime());
        day.setBreakStartTime(request.breakStartTime());
        day.setBreakEndTime(request.breakEndTime());
        day.setDayOff(request.isDayOff());
        day.setScheduleSettings(settings); // Link back to parent
        return day;
    }

    private static WorkingDayResponse toWorkingDayResponse(WorkingDay entity) {
        return new WorkingDayResponse(
                entity.getId(),
                entity.getDayOfWeek().name(),
                entity.getStartTime(),
                entity.getEndTime(),
                entity.getBreakStartTime(),
                entity.getBreakEndTime(),
                entity.isDayOff()
        );
    }
}
