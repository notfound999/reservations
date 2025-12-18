package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessSchedule.TimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface TimeOffRepository extends JpaRepository<TimeOff, UUID> {
    List<TimeOff> findByScheduleSettingsBusinessId(UUID businessId);

    // Useful later: find if any time-off exists for a specific date
    @Query("SELECT t FROM TimeOff t WHERE t.scheduleSettings.business.id = :businessId " +
            "AND :requestedDate BETWEEN t.startDateTime AND t.endDateTime")
    List<TimeOff> findOverlappingTimeOff(UUID businessId, LocalDateTime requestedDate);
}
