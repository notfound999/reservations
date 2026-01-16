package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.entities.BusinessEntities.Business;
import com.myapp.reservations.entities.Reservation.Reservation;
import com.myapp.reservations.entities.Reservation.ReservationStatus;
import com.myapp.reservations.entities.BusinessSchedule.Offering;
import com.myapp.reservations.entities.User.User;

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
        reservation.setStartDateTime(request.startTime());

        // 2. Calculate endDateTime from the offering duration
        if (offering != null && offering.getDurationMinutes() != null) {
            reservation.setEndDateTime(request.startTime().plusMinutes(offering.getDurationMinutes()));
        }

        reservation.setStatus(ReservationStatus.PENDING);
        return reservation;
    }

    public static ReservationResponse toResponse(Reservation reservation) {
        if (reservation == null) return null;

        return new ReservationResponse(
                reservation.getId(),
                reservation.getBusiness().getId(),
                reservation.getBusiness().getName(),
                reservation.getOffering().getId(),
                reservation.getOffering().getName(),
                reservation.getUser().getId(),
                reservation.getUser().getName(),
                reservation.getStartDateTime(),
                reservation.getEndDateTime(),
                reservation.getStatus(),
                LocalDateTime.now()
        );
    }

}