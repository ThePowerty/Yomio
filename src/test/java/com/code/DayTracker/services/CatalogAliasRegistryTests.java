package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class CatalogAliasRegistryTests {

    private final CatalogAliasRegistry registry = new CatalogAliasRegistry(new ObjectMapper());

    @Test
    void findsAniListIdBySpanishLocalizedTitle() {
        assertThat(registry.findMatchingIds("Estoy siendo criada por villanos"))
                .containsExactly(167171);
        assertThat(registry.localizedTitle(167171))
                .isEqualTo("Estoy siendo criada por villanos");
    }
}
