package com.myapp.reservations.DTO.ReservationDTOs;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservationResponse(

        UUID id,
        String businessName,
        String serviceName,
        Double price,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String status

) {
}
