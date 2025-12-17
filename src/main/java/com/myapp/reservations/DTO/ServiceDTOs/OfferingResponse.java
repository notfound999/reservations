package com.myapp.reservations.DTO.ServiceDTOs;

import java.util.UUID;

public record OfferingResponse(
        UUID id,
        String name,
        String description,
        Double price,
        Integer durationMinutes,
        Integer bufferTimeMinutes,
        UUID businessId

) {
}
