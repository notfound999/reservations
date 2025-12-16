package com.myapp.reservations.entities.BusinessSchedule;

import com.myapp.reservations.entities.Business;
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

        private Integer minAdvanceBookingHours;

        private Integer maxAdvanceBookingDays;

        // "Default Appointment Duration"
        // Useful if a service doesn't specify its own length
        private Integer defaultSlotDurationMinutes;

        // "Auto-Confirm?"
        // true = instant booking. false = business owner must approve.
        private Boolean autoConfirmAppointments;

        // --- The Weekly Structure ---

        // One Schedule has 7 days of working hours (Mon-Sun)
        @OneToMany(mappedBy = "scheduleSettings", cascade = CascadeType.ALL)
        private List<WorkingDay> workingDays;

        // Link back to business (optional, depending on your query needs)
        @OneToOne(mappedBy = "scheduleSettings")
        private Business business;
}
