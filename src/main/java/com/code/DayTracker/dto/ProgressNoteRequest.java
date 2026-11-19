package com.code.DayTracker.dto;
import jakarta.validation.constraints.*;
public record ProgressNoteRequest(@NotNull @Min(0) Integer unitNumber,@Min(0) Integer volumeNumber,@NotBlank @Size(max=2000) String content){}
