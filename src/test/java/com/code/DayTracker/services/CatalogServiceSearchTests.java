package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.integrations.anilist.AniListClient;
import com.code.DayTracker.integrations.kitsu.KitsuClient;
import com.code.DayTracker.integrations.mangadex.MangaDexClient;
import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.repositories.CatalogMediaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class CatalogServiceSearchTests {

    @Test
    void publicationStatusComposesWithTypeAndQuery() {
        CatalogMediaRepository repository = mock(CatalogMediaRepository.class);
        CatalogService service = service(repository);
        PageRequest pageRequest = PageRequest.of(0, 12);
        when(repository.search("clover", MediaType.ANIME, "RELEASING", pageRequest))
                .thenReturn(new PageImpl<>(java.util.List.of(), pageRequest, 0));

        var result = service.searchPage("  clover  ", MediaType.ANIME, "  RELEASING  ", 0, 12);

        assertThat(result.items()).isEmpty();
        verify(repository).search("clover", MediaType.ANIME, "RELEASING", pageRequest);
    }

    private CatalogService service(CatalogMediaRepository repository) {
        return new CatalogService(
                mock(AniListClient.class), repository, mock(CatalogAliasRegistry.class),
                mock(MangaDexClient.class), mock(KitsuClient.class),
                2, 10, 10, 10, 50, false, "", false
        );
    }
}
