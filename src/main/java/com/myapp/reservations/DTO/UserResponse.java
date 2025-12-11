package com.myapp.reservations.DTO;

import com.myapp.reservations.entities.Role;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Set<String> roles
) {}

