package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.TimeOffDTOs.TimeOffRequest;
import com.myapp.reservations.DTO.TimeOffDTOs.TimeOffResponse;
import com.myapp.reservations.Services.TimeOffService;
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
    @DeleteMapping("/{id}")
    public void deleteTimeOff(@PathVariable UUID id) {
        timeOffService.deleteTimeOff(id);
    }
}