package com.myapp.reservations.Repository;

import com.myapp.reservations.entities.BusinessEntities.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BusinessRepository extends JpaRepository<Business, UUID> {
    Optional<Business> getBusinessById(UUID uuid);
    Optional<Business> getBusinessByName(String name);
    @Query("SELECT b FROM Business b WHERE b.owner.id = :ownerId")
    List<Business> getAllBusinessByUserId(@Param("ownerId") UUID ownerId);
}
