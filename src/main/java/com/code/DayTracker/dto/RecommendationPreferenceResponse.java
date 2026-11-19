package com.code.DayTracker.dto;
import com.code.DayTracker.models.MediaType;
import java.util.List;
public record RecommendationPreferenceResponse(List<String> genres,List<MediaType> formats){}
