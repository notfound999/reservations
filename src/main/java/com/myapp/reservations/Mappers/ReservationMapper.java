package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.Reservation;
import com.myapp.reservations.entities.BusinessSchedule.ReservationStatus;
import com.myapp.reservations.entities.BusinessSchedule.Offering;
import com.myapp.reservations.entities.User;

import java.time.LocalDateTime;

public class ReservationMapper {

    /**
     * Converts Request DTO + Entities into the Reservation Entity
     * Used during the CREATE process.
     */
    public static Reservation toReservation(ReservationRequest request, Business business, Offering offering, User user) {
        if (request == null) return null;

        Reservation reservation = new Reservation();
        reservation.setBusiness(business);
        reservation.setOffering(offering);
        reservation.setUser(user);

        // 1. Set the Start
        reservation.setStartDateTime(request.startDateTime());

        // 2. Logic: If endDateTime is provided in request, use it.
        // Otherwise, calculate it from the offering duration (for Slot-based).
        if (request.endDateTime() != null) {
            reservation.setEndDateTime(request.endDateTime());
        } else if (offering != null && offering.getDurationMinutes() != null) {
            reservation.setEndDateTime(request.startDateTime().plusMinutes(offering.getDurationMinutes()));
        }

        reservation.setStatus(ReservationStatus.PENDING);
        return reservation;
    }

    public static ReservationResponse toResponse(Reservation reservation) {
        if (reservation == null) return null;

        return new ReservationResponse(
                reservation.getId(),
                reservation.getBusiness().getId(),
                reservation.getOffering().getId(),
                reservation.getOffering().getName(),
                reservation.getUser().getId(),
                reservation.getUser().getName(), // Assuming User has a getName()
                reservation.getStartDateTime(),
                reservation.getEndDateTime(),
                reservation.getStatus(),
                LocalDateTime.now() // For createdAt, or use a field from entity if you have one
        );
    }

}