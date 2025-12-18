package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessSchedule.WorkingDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.UUID;

public interface WorkingDayRepository extends JpaRepository<WorkingDay,UUID> {
    WorkingDay findByScheduleSettingsIdAndDayOfWeek(UUID scheduleId, DayOfWeek dayOfWeek);

}
