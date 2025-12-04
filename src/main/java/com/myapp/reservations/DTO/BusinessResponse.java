package com.myapp.reservations.DTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BusinessResponse(
        UUID id,
        String name,
        String description,
        String address,
        String phone,
        UserResponse owner,          // full owner info
        List<UserResponse> admins,   // full admin info
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
