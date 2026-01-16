package com.myapp.reservations.entities.BusinessSchedule;

import com.myapp.reservations.entities.BusinessEntities.Business;
import com.myapp.reservations.entities.Reservation.ReservationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleSettings {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        private UUID id;

        // Reservation mode: SLOT (Barber) or RANGE (Office)
        @Enumerated(EnumType.STRING)
        private ReservationType reservationType;

        // Combined Duration:
        // If SLOT: value is 30, unit is MINUTES.
        // If RANGE: value is 1, unit is DAYS.
        private Integer slotDurationValue;

        @Enumerated(EnumType.STRING)
        private java.time.temporal.ChronoUnit slotDurationUnit;

        private Integer minAdvanceBookingHours;
        private Integer maxAdvanceBookingDays;
        private Boolean autoConfirmAppointments;

        @OneToMany(mappedBy = "scheduleSettings", cascade = CascadeType.ALL)
        private List<WorkingDay> workingDays;

        @OneToOne(mappedBy = "scheduleSettings")
        private Business business;
}
