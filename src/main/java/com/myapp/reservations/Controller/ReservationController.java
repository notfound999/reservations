package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Services.ReservationService;
import com.myapp.reservations.Services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userService;

    public ReservationController(ReservationService reservationService, UserService userService) {
        this.reservationService = reservationService;
        this.userService = userService;
    }



    @PostMapping("/create")
    public ReservationResponse createReservation(@RequestBody  ReservationRequest request){
        return reservationService.createReservation(request);

    }

    // This endpoint allows: PATCH http://localhost:8080/api/reservations/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@PathVariable UUID id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build(); // 204 No Content is standard for successful updates with no body
    }

    @GetMapping("/mine")
    public List<ReservationResponse> getMyReservations() {
        UUID currentUserId = userService.getCurrentUserId();
        return reservationService.getMyReservations(currentUserId);
    }

    @GetMapping("/business/{businessId}")
    public List<ReservationResponse> getReservationsByBusiness(@PathVariable UUID businessId) {
        return reservationService.getReservationsByBusiness(businessId);
    }
}