package com.code.DayTracker.dto;

import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.models.ReadingStatus;
import java.time.Instant;

public record TrackedItemResponse(
        Long id,
        Long catalogMediaId,
        Integer latestReleasedUnit,
        Instant nextReleaseAt,
        String catalogStatus,
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
        Instant updatedAt,
        boolean favorite
) {
    public static TrackedItemResponse from(TrackedItem item) {
        ReadingStatus effectiveStatus = effectiveStatus(item);
        boolean effectivelyFinished = effectiveStatus == ReadingStatus.COMPLETED;
        return new TrackedItemResponse(
                item.getId(),
                item.getCatalogMedia() == null ? null : item.getCatalogMedia().getId(),
                item.getCatalogMedia() == null ? null : item.getCatalogMedia().getLatestReleasedUnit(),
                item.getCatalogMedia() == null ? null : item.getCatalogMedia().getNextReleaseAt(),
                item.getCatalogMedia() == null ? null : item.getCatalogMedia().getStatus(),
                item.getTitle(),
                item.getType(),
                item.getCurrentChapter(),
                item.getTotalChapters(),
                effectiveStatus,
                calculateProgress(item.getCurrentChapter(), item.getTotalChapters(),
                        item.getCatalogMedia() == null ? null : item.getCatalogMedia().getLatestReleasedUnit()),
                item.getScore(),
                effectivelyFinished,
                item.getNotes(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                item.isFavorite()
        );
    }

    private static ReadingStatus effectiveStatus(TrackedItem item) {
        if (item.getReadingStatus() != ReadingStatus.UP_TO_DATE || item.getCatalogMedia() == null
                || "RELEASING".equalsIgnoreCase(item.getCatalogMedia().getStatus())) {
            return item.getReadingStatus();
        }
        if (!"FINISHED".equalsIgnoreCase(item.getCatalogMedia().getStatus())) {
            return ReadingStatus.READING;
        }
        Integer finalUnit = item.getTotalChapters() != null
                ? item.getTotalChapters() : item.getCatalogMedia().getLatestReleasedUnit();
        return finalUnit != null && item.getCurrentChapter() >= finalUnit
                ? ReadingStatus.COMPLETED : ReadingStatus.READING;
    }

    private static int calculateProgress(Integer currentChapter, Integer totalChapters, Integer latestReleasedUnit) {
        Integer progressLimit = totalChapters != null ? totalChapters : latestReleasedUnit;
        if (currentChapter == null || progressLimit == null || progressLimit <= 0) {
            return 0;
        }
        return Math.min(100, (int) Math.round(currentChapter * 100.0 / progressLimit));
    }
}
