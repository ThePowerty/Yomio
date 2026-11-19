package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.integrations.anilist.AniListClient;
import com.code.DayTracker.integrations.anilist.AniListMedia;
import com.code.DayTracker.integrations.kitsu.KitsuClient;
import com.code.DayTracker.integrations.mangadex.MangaDexClient;
import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.repositories.CatalogMediaRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class CatalogServiceRefreshTests {

    @Test
    void animeRefreshIncludesCurrentlyReleasingTitlesAndDeduplicatesPopularOnes() {
        AniListClient aniListClient = mock(AniListClient.class);
        CatalogMediaRepository repository = mock(CatalogMediaRepository.class);
        CatalogAliasRegistry aliasRegistry = mock(CatalogAliasRegistry.class);
        MangaDexClient mangaDexClient = mock(MangaDexClient.class);
        KitsuClient kitsuClient = mock(KitsuClient.class);
        CatalogService service = new CatalogService(
                aniListClient, repository, aliasRegistry, mangaDexClient, kitsuClient,
                2, 10, 10, 10, 50, false, "", false
        );
        AniListMedia popular = anime(1, "Popular Anime", "FINISHED");
        AniListMedia blackClover = anime(195604, "Black Clover 2nd Season", "RELEASING");
        when(aniListClient.popular(MediaType.ANIME, 10, 50)).thenReturn(List.of(popular));
        when(aniListClient.releasing(MediaType.ANIME, 10, 50)).thenReturn(List.of(popular, blackClover));
        when(repository.findByAnilistId(anyInt())).thenReturn(Optional.empty());
        when(kitsuClient.popularAnime()).thenReturn(List.of());

        int updated = service.refreshCatalog(MediaType.ANIME);

        assertThat(updated).isEqualTo(2);
        verify(aniListClient).popular(MediaType.ANIME, 10, 50);
        verify(aniListClient).releasing(MediaType.ANIME, 10, 50);
        ArgumentCaptor<CatalogMedia> saved = ArgumentCaptor.forClass(CatalogMedia.class);
        verify(repository, org.mockito.Mockito.times(2)).save(saved.capture());
        assertThat(saved.getAllValues())
                .extracting(CatalogMedia::getAnilistId)
                .containsExactly(1, 195604);
        assertThat(saved.getAllValues().get(1).getStatus()).isEqualTo("RELEASING");
    }

    private AniListMedia anime(int id, String title, String status) {
        return new AniListMedia(
                id,
                new AniListMedia.AniListTitle(title, title, null),
                null,
                null,
                null,
                status,
                null,
                null,
                null,
                80,
                1000,
                List.of("Fantasy"),
                List.of(),
                new AniListMedia.AniListDate(2026),
                null,
                2026,
                "JP",
                "MANGA",
                1L,
                null
        );
    }
}
