package com.myapp.reservations.DTO;

import java.util.List;
import java.util.UUID;

public record BusinessDTO(
        UUID id,
        String name,
        String owner,
        List<String> admins
) {
}
