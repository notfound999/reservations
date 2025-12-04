package com.myapp.reservations.DTO;

import java.util.List;
import java.util.UUID;

public record BusinessDto(
        UUID id,
        String name,
        String description,
        String address,
        String phone,
        com.myapp.reservations.entities.User owner,
        List<com.myapp.reservations.entities.User> admins
) {
}
