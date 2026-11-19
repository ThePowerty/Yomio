package com.code.DayTracker.dto;

import com.code.DayTracker.models.ContactCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(
        @NotNull ContactCategory category,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 2000) String message
) {}
