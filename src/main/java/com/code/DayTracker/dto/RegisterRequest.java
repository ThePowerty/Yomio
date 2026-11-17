package com.code.DayTracker.dto;

import com.code.DayTracker.models.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        String username,

        @NotBlank
        @Email
        @Size(max = 120)
        String email,

        @NotBlank
        @Size(min = 8, max = 100)
        String password,

        Role role
) {
}
