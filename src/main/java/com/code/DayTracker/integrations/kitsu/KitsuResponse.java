package com.code.DayTracker.integrations.kitsu;

import java.util.List;
import java.util.Map;

public record KitsuResponse(List<KitsuResource> data) {
    public record KitsuResource(String id, KitsuAttributes attributes) {
    }

    public record KitsuAttributes(
            String canonicalTitle,
            Map<String, String> titles,
            String synopsis,
            KitsuImage posterImage,
            String status,
            Integer episodeCount,
            String averageRating,
            Integer userCount,
            String startDate,
            String endDate,
            String subtype
    ) {
    }

    public record KitsuImage(String large, String original) {
    }
}
