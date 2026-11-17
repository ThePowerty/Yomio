package com.code.DayTracker.dto;

import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TrackedItemRequest(
        @NotBlank
        @Size(max = 180)
        String title,

        @NotNull
        MediaType type,

        @NotNull
        @Min(0)
        Integer currentChapter,

        @Min(0)
        Integer totalChapters,

        @NotNull
        ReadingStatus readingStatus,

        @Min(0)
        @Max(10)
        Integer score,

        boolean finished,

        @Size(max = 1000)
        String notes
) {
}
