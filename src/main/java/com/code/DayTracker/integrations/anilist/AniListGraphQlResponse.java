package com.code.DayTracker.integrations.anilist;

import java.util.List;

public record AniListGraphQlResponse(
        AniListData data
) {
    public record AniListData(AniListPage Page, AniListMedia Media) {
    }

    public record AniListPage(List<AniListMedia> media) {
    }
}
