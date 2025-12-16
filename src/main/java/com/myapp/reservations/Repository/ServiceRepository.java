package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessSchedule.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceRepository extends JpaRepository<Service, UUID> {
}
