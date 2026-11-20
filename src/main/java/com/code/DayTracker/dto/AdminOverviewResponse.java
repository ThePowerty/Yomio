package com.code.DayTracker.dto;

public record AdminOverviewResponse(
        long totalUsers,
        long regularUsers,
        long adminUsers,
        long totalMessages,
        long unresolvedMessages
) {
}
