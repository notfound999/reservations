package com.myapp.reservations.controller;

import com.myapp.reservations.dto.timeoffdto.TimeOffRequest;
import com.myapp.reservations.dto.timeoffdto.TimeOffResponse;
import com.myapp.reservations.service.TimeOffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/time-off")
@RequiredArgsConstructor
public class TimeOffController {

    private final TimeOffService timeOffService;

    // Add a vacation or break
    @PostMapping("/business/{businessId}")
    public ResponseEntity<String> addTimeOff(@PathVariable UUID businessId, @RequestBody TimeOffRequest request) {
        timeOffService.addTimeOff(businessId, request);
        return ResponseEntity.ok("Time off recorded successfully");
    }

    // Get all time-off blocks for a business
    @GetMapping("/business/{businessId}")
    public List<TimeOffResponse> getTimeOffs(@PathVariable UUID businessId) {
        return timeOffService.getBusinessTimeOff(businessId);
    }

    // Delete a specific time-off block (e.g., if a vacation is cancelled)
    @DeleteMapping("/{timeOffId}")
    public void deleteTimeOff(@PathVariable UUID timeOffId) {
        timeOffService.deleteTimeOff(timeOffId);
    }
}