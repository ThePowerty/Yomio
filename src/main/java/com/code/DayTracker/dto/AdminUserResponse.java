package com.code.DayTracker.dto;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;

public record AdminUserResponse(
        Long id,
        String username,
        String email,
        Role role,
        boolean policiesAccepted
) {
    public static AdminUserResponse from(AppUser user) {
        return new AdminUserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.hasAcceptedPolicies()
        );
    }
}
