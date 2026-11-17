package com.code.DayTracker.integrations.mangadex;

import java.util.List;
import java.util.Map;

public record MangaDexResponse(List<MangaDexData> data, Integer total) {

    public record MangaDexData(String id, MangaDexAttributes attributes) {
    }

    public record MangaDexAttributes(
            Map<String, String> title,
            List<Map<String, String>> altTitles,
            Map<String, String> links,
            String originalLanguage,
            String lastChapter,
            String status,
            Integer year
    ) {
    }
}
