package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.Business;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BusinessRepository extends JpaRepository<Business, UUID> {
}
