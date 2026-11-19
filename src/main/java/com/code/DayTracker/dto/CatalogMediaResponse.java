package com.code.DayTracker.dto;

import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import java.time.Instant;
import java.util.List;

public record CatalogMediaResponse(
        Long id,
        Integer anilistId,
        MediaType type,
        String title,
        String titleEnglish,
        String titleNative,
        String titleLocalized,
        List<String> aliases,
        String description,
        String coverImage,
        String bannerImage,
        String status,
        Integer episodes,
        Integer chapters,
        Integer volumes,
        Integer averageScore,
        Integer popularity,
        List<String> genres,
        Integer startYear,
        Integer endYear,
        Integer seasonYear,
        String countryOfOrigin,
        String source,
        Instant lastSyncedAt,
        Integer latestReleasedUnit,
        Instant nextReleaseAt
) {
    public static CatalogMediaResponse from(CatalogMedia media) {
        return new CatalogMediaResponse(
                media.getId(),
                media.getAnilistId(),
                media.getType(),
                media.getTitle(),
                media.getTitleEnglish(),
                media.getTitleNative(),
                media.getTitleLocalized(),
                parseValues(media.getAliases()),
                media.getDescription(),
                media.getCoverImage(),
                media.getBannerImage(),
                media.getStatus(),
                media.getEpisodes(),
                media.getChapters(),
                media.getVolumes(),
                media.getAverageScore(),
                media.getPopularity(),
                parseValues(media.getGenres()),
                media.getStartYear(),
                media.getEndYear(),
                media.getSeasonYear(),
                media.getCountryOfOrigin(),
                media.getSource(),
                media.getLastSyncedAt(),
                media.getLatestReleasedUnit(),
                media.getNextReleaseAt()
        );
    }

    private static List<String> parseValues(String values) {
        if (values == null || values.isBlank()) {
            return List.of();
        }
        return List.of(values.split("\\|"));
    }
}
