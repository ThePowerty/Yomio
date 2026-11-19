package com.code.DayTracker.integrations.anilist;

import java.util.List;

public record AniListMedia(
        Integer id,
        AniListTitle title,
        String description,
        AniListCoverImage coverImage,
        String bannerImage,
        String status,
        Integer episodes,
        Integer chapters,
        Integer volumes,
        Integer averageScore,
        Integer popularity,
        List<String> genres,
        List<String> synonyms,
        AniListDate startDate,
        AniListDate endDate,
        Integer seasonYear,
        String countryOfOrigin,
        String source,
        Long updatedAt,
        AniListAiring nextAiringEpisode
) {
    public record AniListTitle(
            String romaji,
            String english,
            String nativeTitle
    ) {
    }

    public record AniListCoverImage(String large) {
    }

    public record AniListDate(Integer year) {
    }

    public record AniListAiring(Integer episode, Long airingAt) {}
}
