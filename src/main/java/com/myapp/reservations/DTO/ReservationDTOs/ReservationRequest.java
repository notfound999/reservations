package com.myapp.reservations.DTO.ReservationDTOs;


import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservationRequest(
        @NotNull UUID businessId,
        @NotNull UUID serviceId,
        @NotNull UUID userId,
        @NotNull LocalDate date,
        @NotNull LocalTime startTime

) {
}
