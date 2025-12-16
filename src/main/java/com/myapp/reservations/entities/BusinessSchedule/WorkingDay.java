package com.myapp.reservations.entities.BusinessSchedule;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class WorkingDay {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek; // MONDAY, TUESDAY...

    private LocalTime startTime; // 09:00
    private LocalTime endTime;   // 17:00

    // "Lunch Break" or "Siesta"
    // Many businesses close for an hour in the middle of the day
    private LocalTime breakStartTime;
    private LocalTime breakEndTime;

    private boolean isDayOff; // If true, ignore times.

    @ManyToOne
    @JoinColumn(name = "schedule_settings_id")
    private ScheduleSettings scheduleSettings;
}
