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
        UserResponse owner,
        List<UserResponse> admins,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
