package com.myapp.reservations.mapper;

import com.myapp.reservations.dto.timeoffdto.offeringdto.OfferingRequest;
import com.myapp.reservations.dto.timeoffdto.offeringdto.OfferingResponse;
import com.myapp.reservations.entities.BusinessSchedule.Offering;

public class OfferingMapper {

    public static Offering toOffering(OfferingRequest request) {
        if (request == null) {
            return null;
        }

        Offering offering = new Offering();
        offering.setName(request.name());
        offering.setDescription(request.description());
        offering.setPrice(request.price());
        offering.setDurationMinutes(request.durationMinutes());
        offering.setBufferTimeMinutes(request.bufferTimeMinutes());

        // Note: The 'business' and 'id' fields are typically set
        // in the Service layer, not inside the basic mapper.

        return offering;
    }


    public static OfferingResponse toResponse(Offering entity) {
        if (entity == null) {
            return null;
        }

        return new OfferingResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getDurationMinutes(),
                entity.getBufferTimeMinutes(),
                entity.getBusiness().getId()
        );
    }
}