package com.code.DayTracker.dto;

public record AdminUserProgressResponse(
        Long userId,
        int totalTracked,
        int activeTitles,
        int completedTitles,
        AdminProgressGroupResponse viewing,
        AdminProgressGroupResponse reading
) {
}
