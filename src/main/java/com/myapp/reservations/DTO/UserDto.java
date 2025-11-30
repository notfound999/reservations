package com.myapp.reservations.DTO;

import java.util.UUID;

public record UserDto(
        UUID id,
        String name,
        String email
) {
}
