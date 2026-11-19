package com.code.DayTracker.integrations.mangadex;

import java.util.List;

public record MangaDexTitle(
        String mangaDexId,
        Integer anilistId,
        String spanishTitle,
        List<String> aliases,
        String lastChapter
) {
}
