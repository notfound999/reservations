package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessSchedule.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
}
