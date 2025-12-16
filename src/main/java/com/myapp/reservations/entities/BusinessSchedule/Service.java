package com.myapp.reservations.entities.BusinessSchedule;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.myapp.reservations.entities.Business;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "business_services")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    /** * Duration in minutes (e.g., 30, 60).
     * This is what your booking logic will use to block the calendar.
     */
    @Column(nullable = false)
    private Integer durationMinutes;

    /**
     * Optional: Buffer time after the service (e.g., 10 mins to clean)
     */
    private Integer bufferTimeMinutes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "b_id", nullable = false)
    @JsonIgnore // CRITICAL: Prevents infinite loop when loading Business -> Service -> Business
    private Business business;
}

