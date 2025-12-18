package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.BusinessDTOs.BusinessResponse;
import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsRequest;
import com.myapp.reservations.DTO.ScheduleSettingsDTOs.ScheduleSettingsResponse;
import com.myapp.reservations.Services.ScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    public final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping()
    public List<ScheduleSettingsResponse> getAllSchedules(){
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/business/{businessId}")
    public ScheduleSettingsResponse getScheduleByBusinessId(@PathVariable UUID businessId){
        return scheduleService.getScheduleByBusinessId(businessId);
    }

    @GetMapping("/{scheduleId}")
    public ScheduleSettingsResponse getScheduleById(@PathVariable UUID scheduleId){
        return scheduleService.getScheduleById(scheduleId);
    }

    @PutMapping("/business/{businessId}")
    public ResponseEntity<String> updateSchedule(
            @PathVariable UUID businessId,
            @RequestBody ScheduleSettingsRequest request) {

        scheduleService.updateSchedule(businessId, request);
        return ResponseEntity.ok("Schedule and working days updated successfully.");
    }
}
