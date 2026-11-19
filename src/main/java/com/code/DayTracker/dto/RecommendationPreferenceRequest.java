package com.code.DayTracker.dto;
import com.code.DayTracker.models.MediaType;
import jakarta.validation.constraints.Size;
import java.util.List;
public record RecommendationPreferenceRequest(@Size(max=12) List<@Size(max=40) String> genres,@Size(max=3) List<MediaType> formats){}
