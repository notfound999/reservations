package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.BusyBlockResponse;
import com.myapp.reservations.Repository.ReservationRepository;
import com.myapp.reservations.Repository.ScheduleSettingsRepository;
import com.myapp.reservations.Repository.TimeOffRepository;
import com.myapp.reservations.entities.BusinessSchedule.Reservation;
import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import com.myapp.reservations.entities.BusinessSchedule.TimeOff;
import com.myapp.reservations.entities.BusinessSchedule.WorkingDay;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class AvailabilityService {

    private final ReservationRepository reservationRepository;
    private final ScheduleSettingsRepository scheduleSettingsRepository;
    private final TimeOffRepository timeOffRepository;

    public AvailabilityService(ReservationRepository reservationRepository , ScheduleSettingsRepository scheduleSettingsRepository, TimeOffRepository timeOffRepository){
        this.scheduleSettingsRepository= scheduleSettingsRepository;
        this.reservationRepository =reservationRepository;
        this.timeOffRepository = timeOffRepository;
    }

    public List<BusyBlockResponse> getBusyBlocks(UUID businessId, LocalDateTime viewStart, LocalDateTime viewEnd) {
        List<BusyBlockResponse> busyBlocks = new ArrayList<>();

        // 1. Fetch Schedule Settings (Opening/Closing Hours)
        ScheduleSettings settings = scheduleSettingsRepository.getScheduleSettingsByBusinessId(businessId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        // 2. Add "Closed" Blocks (When the business is naturally shut)
        busyBlocks.addAll(calculateClosedBlocks(settings, viewStart, viewEnd));

        // 3. Add "Existing Reservations" (Actual bookings)
        List<Reservation> reservations = reservationRepository.findActiveByBusinessInRange(businessId, viewStart, viewEnd);
        for (Reservation res : reservations) {
            busyBlocks.add(new BusyBlockResponse(res.getStartDateTime(), res.getEndDateTime(), "OCCUPIED"));
        }

        // 4. Add "Time Off" (Owner vacations/manual blocks)
        // ... similar logic for TimeOff entities
        List<TimeOff> TimeOffs = timeOffRepository.findByBusinessIdAndRange(businessId, viewStart, viewEnd);
        for (TimeOff timeOff : TimeOffs) {
            busyBlocks.add(new BusyBlockResponse(timeOff.getStartDateTime(), timeOff.getEndDateTime(), "OCCUPIED"));
        }

        busyBlocks.sort(Comparator.comparing(BusyBlockResponse::start));

        return busyBlocks;
    }

    private List<BusyBlockResponse> calculateClosedBlocks(ScheduleSettings settings, LocalDateTime start, LocalDateTime end) {
        List<BusyBlockResponse> closedBlocks = new ArrayList<>();

        // Loop through every day in the requested view range
        for (LocalDateTime date = start; date.isBefore(end); date = date.plusDays(1)) {
            DayOfWeek dow = date.getDayOfWeek();
            WorkingDay dayConfig = settings.getWorkingDays().stream()
                    .filter(wd -> wd.getDayOfWeek().equals(dow))
                    .findFirst().orElse(null);

            if (dayConfig == null || dayConfig.isDayOff()) {
                // Whole day is busy
                closedBlocks.add(new BusyBlockResponse(date.with(LocalTime.MIN), date.with(LocalTime.MAX), "CLOSED"));
            } else {
                // Add block for before opening
                closedBlocks.add(new BusyBlockResponse(date.with(LocalTime.MIN), date.with(dayConfig.getStartTime()), "CLOSED"));
                // Add block for lunch break if it exists
                if (dayConfig.getBreakStartTime() != null) {
                    closedBlocks.add(new BusyBlockResponse(date.with(dayConfig.getBreakStartTime()), date.with(dayConfig.getBreakEndTime()), "BREAK"));
                }
                // Add block for after closing
                closedBlocks.add(new BusyBlockResponse(date.with(dayConfig.getEndTime()), date.with(LocalTime.MAX), "CLOSED"));
            }
        }
        return closedBlocks;
    }
}
