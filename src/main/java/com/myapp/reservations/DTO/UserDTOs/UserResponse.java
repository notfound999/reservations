package com.myapp.reservations.DTO.UserDTOs;

import java.util.Set;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String phone,
        Set<String> roles
) {}

