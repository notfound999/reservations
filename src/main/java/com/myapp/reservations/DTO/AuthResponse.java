package com.myapp.reservations.DTO;

import com.myapp.reservations.DTO.UserDTOs.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {
}