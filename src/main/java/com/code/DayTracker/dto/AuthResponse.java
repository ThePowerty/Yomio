package com.code.DayTracker.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
