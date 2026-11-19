package com.code.DayTracker.dto;
import com.code.DayTracker.models.ChapterRating;
import java.time.Instant;
public record ChapterRatingResponse(Long id,Long mediaId,Integer unitNumber,Integer rating,Instant updatedAt){public static ChapterRatingResponse from(ChapterRating r){return new ChapterRatingResponse(r.getId(),r.getMedia().getId(),r.getUnitNumber(),r.getRating(),r.getUpdatedAt());}}
