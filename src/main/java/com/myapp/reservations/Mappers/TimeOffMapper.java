package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.TimeOffDTOs.TimeOffRequest;
import com.myapp.reservations.DTO.TimeOffDTOs.TimeOffResponse;
import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import com.myapp.reservations.entities.BusinessSchedule.TimeOff;

public class TimeOffMapper {

    /**
     * Converts a TimeOffRequest into a TimeOff Entity.
     * Name: toTimeOff
     */
    public static TimeOff toTimeOff(TimeOffRequest request, ScheduleSettings settings) {
        if (request == null) {
            return null;
        }

        TimeOff timeOff = new TimeOff();
        timeOff.setStartDateTime(request.startDateTime());
        timeOff.setEndDateTime(request.endDateTime());
        timeOff.setReason(request.reason());

        // Establishes the relationship for the database foreign key
        timeOff.setScheduleSettings(settings);

        return timeOff;
    }

    /**
     * Converts a TimeOff Entity into a TimeOffResponse Record.
     * Name: toResponse
     */
    public static TimeOffResponse toResponse(TimeOff entity) {
        if (entity == null) {
            return null;
        }

        return new TimeOffResponse(
                entity.getId(),
                entity.getStartDateTime(),
                entity.getEndDateTime(),
                entity.getReason()
        );
    }
}