package com.myapp.reservations.Services;

import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsRequest;
import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsResponse;
import com.myapp.reservations.DTO.WorkingDayDTOs.WorkingDayRequest;
import com.myapp.reservations.Mappers.ScheduleMapper;
import com.myapp.reservations.Repository.BusinessRepository;
import com.myapp.reservations.Repository.ScheduleSettingsRepository;
import com.myapp.reservations.Repository.WorkingDayRepository;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.ReservationType;
import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import com.myapp.reservations.entities.BusinessSchedule.WorkingDay;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
public class ScheduleService {

    private final ScheduleSettingsRepository scheduleSettingsRepository;
    private final WorkingDayRepository workingDayRepository;
    private final BusinessRepository businessRepository;

    public ScheduleService(ScheduleSettingsRepository scheduleSettingsRepository, WorkingDayRepository workingDayRepository, BusinessRepository businessRepository){
        this.scheduleSettingsRepository=scheduleSettingsRepository;
        this.workingDayRepository=workingDayRepository;
        this.businessRepository = businessRepository;
    }

    public void createDefaultSchedule(Business business) {
        // 1. Create the Settings object
        ScheduleSettings settings = new ScheduleSettings();
        settings.setSlotDurationValue(30);
        settings.setSlotDurationUnit(ChronoUnit.MINUTES);
        settings.setReservationType(ReservationType.SLOT);
        settings.setAutoConfirmAppointments(true);
        settings.setMinAdvanceBookingHours(2);
        settings.setMaxAdvanceBookingDays(30);

        // 2. IMPORTANT: Link the Business (The field you asked about)
        // This connects the ScheduleSettings back to its owner
        settings.setBusiness(business);

        // 3. Generate exactly 7 days
        List<WorkingDay> days = new ArrayList<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            WorkingDay wd = new WorkingDay();
            wd.setDayOfWeek(day);
            wd.setStartTime(LocalTime.of(9, 0));
            wd.setEndTime(LocalTime.of(17, 0));

            // Set weekends as Day Off by default
            wd.setDayOff(day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY);

            // Link the WorkingDay to the ScheduleSettings
            wd.setScheduleSettings(settings);
            days.add(wd);
        }

        settings.setWorkingDays(days);

    }

    public void updateSchedule(UUID businessId, ScheduleSettingsRequest request) {
        if (businessId == null) return;

        ScheduleSettings existing = scheduleSettingsRepository.getScheduleSettingsByBusinessId(businessId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));


        if (request.reservationType() != null) {
            existing.setReservationType(request.reservationType());
        }
        if (request.slotDurationValue() != null) {
            existing.setSlotDurationValue(request.slotDurationValue());
        }
        if (request.slotDurationUnit() != null) {
            existing.setSlotDurationUnit(request.slotDurationUnit());
        }
        if (request.minAdvanceBookingHours() != null) {
            existing.setMinAdvanceBookingHours(request.minAdvanceBookingHours());
        }
        if (request.maxAdvanceBookingDays() != null) {
            existing.setMaxAdvanceBookingDays(request.maxAdvanceBookingDays());
        }
        if (request.autoConfirmAppointments() != null) {
            existing.setAutoConfirmAppointments(request.autoConfirmAppointments());
        }

        for (WorkingDayRequest dayReq : request.workingDays()) {
            WorkingDay existingDay = workingDayRepository
                    .findByScheduleSettingsIdAndDayOfWeek(existing.getId(), DayOfWeek.valueOf(dayReq.dayOfWeek()));

            updateDayDetails(existingDay, dayReq);
        }

        scheduleSettingsRepository.save(existing);
    }

    private void updateDayDetails(WorkingDay entity, WorkingDayRequest req) {
        // Map data from DTO to Entity
        entity.setStartTime(req.startTime());
        entity.setEndTime(req.endTime());
        entity.setBreakStartTime(req.breakStartTime());
        entity.setBreakEndTime(req.breakEndTime());
        entity.setDayOff(req.isDayOff());

        // ONLY validate times if the business is actually open that day
        if (!entity.isDayOff()) {
            validateWorkingHours(entity);
        }
    }

    private void validateWorkingHours(WorkingDay day) {
        // Logic: Start < End
        if (day.getStartTime().isAfter(day.getEndTime())) {
            throw new IllegalArgumentException("Opening time must be before closing time for " + day.getDayOfWeek());
        }

        // Logic: Start < BreakStart < BreakEnd < End
        if (day.getBreakStartTime() != null && day.getBreakEndTime() != null) {
            if (day.getBreakStartTime().isAfter(day.getBreakEndTime())) {
                throw new IllegalArgumentException("Break start must be before break end for " + day.getDayOfWeek());
            }

            boolean isInside = day.getBreakStartTime().isAfter(day.getStartTime()) &&
                    day.getBreakEndTime().isBefore(day.getEndTime());

            if (!isInside) {
                throw new IllegalArgumentException("Break must be within working hours for " + day.getDayOfWeek());
            }
        }
    }

    public ScheduleSettingsResponse getScheduleById(UUID scheduleId){
        return ScheduleMapper.toResponse(scheduleSettingsRepository.getScheduleSettingsById(scheduleId));

    }

    public ScheduleSettingsResponse getScheduleByBusinessId(UUID businessId){
        if(businessId ==null){
            return null;
        }
        Business business = businessRepository.getBusinessById(businessId).orElseThrow(()-> new RuntimeException("Business not found"));

        return ScheduleMapper.toResponse(business.getScheduleSettings());

    }

    public List<ScheduleSettingsResponse> getAllSchedules(){
        return scheduleSettingsRepository.findAll().stream().map(ScheduleMapper::toResponse).toList();
    }
}
