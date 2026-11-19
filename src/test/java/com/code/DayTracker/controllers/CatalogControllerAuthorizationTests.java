package com.code.DayTracker.controllers;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.services.CatalogService;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

class CatalogControllerAuthorizationTests {

    private CatalogService catalogService;
    private CatalogController controller;

    @BeforeEach
    void setUp() {
        catalogService = mock(CatalogService.class);
        controller = new CatalogController(catalogService);
    }

    @Test
    void regularUsersCannotRefreshCatalog() {
        assertThrows(AccessDeniedException.class,
                () -> controller.refresh(MediaType.ANIME, authentication("USER")));

        verifyNoInteractions(catalogService);
    }

    @Test
    void administratorsCanRefreshCatalog() {
        controller.refresh(MediaType.ANIME, authentication("ADMIN"));

        verify(catalogService).refreshCatalog(MediaType.ANIME);
    }

    @Test
    void regularUsersCannotImportMissingCatalogEntries() {
        assertThrows(AccessDeniedException.class,
                () -> controller.search("Frieren", MediaType.ANIME, 20, true, authentication("USER")));

        verifyNoInteractions(catalogService);
    }

    @Test
    void administratorsCanImportMissingCatalogEntries() {
        controller.search("Frieren", MediaType.ANIME, 20, true, authentication("ADMIN"));

        verify(catalogService).searchAndImport("Frieren", MediaType.ANIME, 20);
    }

    @Test
    void regularUsersCanSearchTheLocalCatalog() {
        controller.search("Frieren", MediaType.ANIME, 20, false, authentication("USER"));

        verify(catalogService).search("Frieren", MediaType.ANIME, 20);
    }

    @Test
    void regularUsersCannotImportMissingCatalogPages() {
        assertThrows(AccessDeniedException.class,
                () -> controller.searchPage("Frieren", MediaType.ANIME, "RELEASING", 0, 12, true, authentication("USER")));

        verifyNoInteractions(catalogService);
    }

    @Test
    void regularUsersCannotRefreshReleaseProgress() {
        assertThrows(AccessDeniedException.class,
                () -> controller.refreshReleaseProgress(authentication("USER")));

        verifyNoInteractions(catalogService);
    }

    private Authentication authentication(String role) {
        return new UsernamePasswordAuthenticationToken(
                "reader",
                "unused",
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}
