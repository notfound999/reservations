package com.myapp.reservations.DTO;

public record SignInRequest(
        String identifier,
        String password
) {
}
