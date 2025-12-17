package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessSchedule.ScheduleSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ScheduleSettingsRepository extends JpaRepository<ScheduleSettings, UUID> {

}
