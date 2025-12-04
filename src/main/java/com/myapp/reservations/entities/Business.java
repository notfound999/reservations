package com.myapp.reservations.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "businesses")
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class Business {

    @Id
    @GeneratedValue(strategy =GenerationType.UUID)
    @Column(name = "b_id",unique = true, nullable = false)
    private UUID id;

    @Column(name = "b_name" ,length = 100,unique = true)
    private String name;

    @Column(name = "b_description" , length = 1000)
    private String description;

    @Column(name = "b_address" )
    private String address;

    @Column(name = "b_phone")
    private String phone;

    @ManyToOne
    @JoinColumn(name = "b_owner_id", nullable = false)
    private User owner;

    @ManyToMany
    @JoinTable(
            name = "b_admins",
            joinColumns = @JoinColumn(name = "b_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> admins = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate(){
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate(){
        this.updatedAt = LocalDateTime.now();
    }
}
