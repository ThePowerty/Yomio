package com.code.DayTracker.dto;

import com.code.DayTracker.models.Role;
import jakarta.validation.constraints.NotNull;

public record AdminRoleUpdateRequest(
        @NotNull Role role
) {
}
