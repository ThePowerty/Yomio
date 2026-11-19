package com.code.DayTracker.dto;
import jakarta.validation.constraints.*;
public record ChapterRatingRequest(@NotNull @Min(1) Integer unitNumber,@NotNull @Min(1) @Max(10) Integer rating){}
