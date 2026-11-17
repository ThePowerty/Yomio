package com.code.DayTracker.dto;

import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.models.ReadingStatus;
import java.time.Instant;

public record TrackedItemResponse(
        Long id,
        String title,
        MediaType type,
        Integer currentChapter,
        Integer totalChapters,
        ReadingStatus readingStatus,
        Integer progress,
        Integer score,
        boolean finished,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static TrackedItemResponse from(TrackedItem item) {
        return new TrackedItemResponse(
                item.getId(),
                item.getTitle(),
                item.getType(),
                item.getCurrentChapter(),
                item.getTotalChapters(),
                item.getReadingStatus(),
                calculateProgress(item.getCurrentChapter(), item.getTotalChapters()),
                item.getScore(),
                item.isFinished(),
                item.getNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    private static int calculateProgress(Integer currentChapter, Integer totalChapters) {
        if (currentChapter == null || totalChapters == null || totalChapters <= 0) {
            return 0;
        }
        return Math.min(100, (int) Math.round(currentChapter * 100.0 / totalChapters));
    }
}
