package com.code.DayTracker.dto;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;

public record UserResponse(
        Long id,
        String username,
        String email,
        Role role
) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
