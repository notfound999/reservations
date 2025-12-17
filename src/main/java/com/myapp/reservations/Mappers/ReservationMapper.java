package com.myapp.reservations.Mappers;

import com.myapp.reservations.DTO.ReservationDTOs.ReservationRequest;
import com.myapp.reservations.DTO.ReservationDTOs.ReservationResponse;
import com.myapp.reservations.entities.Business;
import com.myapp.reservations.entities.BusinessSchedule.Reservation;
import com.myapp.reservations.entities.BusinessSchedule.ReservationStatus;
import com.myapp.reservations.entities.BusinessSchedule.Offering;
import com.myapp.reservations.entities.User;

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
        reservation.setDate(request.date());
        reservation.setStartTime(request.startTime());

        // Logic: Calculate end time automatically based on service duration
        if (request.startTime() != null && offering != null) {
            reservation.setEndTime(request.startTime().plusMinutes(offering.getDurationMinutes()));
        }

        reservation.setStatus(ReservationStatus.PENDING); // Default status
        return reservation;
    }

    /**
     * Converts Reservation Entity into a Response Record
     * Used for sending data to the Frontend.
     */
    public static ReservationResponse toResponse(Reservation reservation) {
        if (reservation == null) return null;

        return new ReservationResponse(
                reservation.getId(),
                reservation.getBusiness().getName(),
                reservation.getOffering().getName(),
                reservation.getOffering().getPrice(),
                reservation.getDate(),
                reservation.getStartTime(),
                reservation.getEndTime(),
                reservation.getStatus().name()
        );
    }
}