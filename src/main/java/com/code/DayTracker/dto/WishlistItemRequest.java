package com.code.DayTracker.dto;

import jakarta.validation.constraints.NotNull;

public record WishlistItemRequest(
        @NotNull Long catalogMediaId,
        boolean favorite
) {
}
