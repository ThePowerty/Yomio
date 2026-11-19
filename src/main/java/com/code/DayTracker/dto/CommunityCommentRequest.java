package com.code.DayTracker.dto;
import jakarta.validation.constraints.*;
public record CommunityCommentRequest(@NotNull @Min(1) Integer unitNumber,Long parentId,@NotBlank @Size(max=2000) String body,boolean spoiler){}
