package com.myapp.reservations.DTO;

import java.util.List;
import java.util.UUID;

public record BusinessDto(
        UUID id,
        String name,
        com.myapp.reservations.entities.User owner,
        List<com.myapp.reservations.entities.User> admins
) {
}
