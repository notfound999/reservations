package com.myapp.reservations.Controller;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.Services.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
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
}