package com.code.DayTracker.dto;

public record AdminProgressGroupResponse(
        int trackedTitles,
        int completedTitles,
        long currentUnits,
        long knownCurrentUnits,
        long knownTotalUnits
) {
}
