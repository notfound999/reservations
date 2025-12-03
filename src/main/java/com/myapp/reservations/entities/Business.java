package com.myapp.reservations.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(name = "b_name" ,length = 100)
    private String name;


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
}
