package com.code.DayTracker.models;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CatalogMediaTests {

    @Test
    void externalMetadataIsBoundedByPersistenceColumnLengths() {
        CatalogMedia media = new CatalogMedia(195604, MediaType.ANIME);
        String longValue = "x".repeat(5001);

        media.updateDetails(
                longValue, longValue, longValue, longValue, longValue,
                longValue, longValue, longValue, longValue,
                null, null, null, null, null, longValue,
                null, null, null, longValue, longValue, null
        );

        assertThat(media.getTitle()).hasSize(220);
        assertThat(media.getTitleEnglish()).hasSize(220);
        assertThat(media.getTitleNative()).hasSize(220);
        assertThat(media.getTitleLocalized()).hasSize(220);
        assertThat(media.getAliases()).hasSize(2000);
        assertThat(media.getDescription()).hasSize(4000);
        assertThat(media.getCoverImage()).hasSize(500);
        assertThat(media.getBannerImage()).hasSize(500);
        assertThat(media.getStatus()).hasSize(40);
        assertThat(media.getGenres()).hasSize(500);
        assertThat(media.getCountryOfOrigin()).hasSize(10);
        assertThat(media.getSource()).hasSize(50);
    }
}
