package com.myapp.reservations.entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Column(name = "b_owner",nullable = false)
    private String owner;

    @Column(name = "b_admins")
    private List<String> admins;

}
