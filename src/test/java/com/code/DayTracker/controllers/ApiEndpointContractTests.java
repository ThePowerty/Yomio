package com.code.DayTracker.controllers;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@SpringBootTest
class ApiEndpointContractTests {

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping mappings;

    @Test
    void allPublishedApiPathsAreRegistered() {
        Set<String> paths = mappings.getHandlerMethods().keySet().stream()
                .flatMap(info -> info.getPatternValues().stream())
                .filter(path -> path.startsWith("/api/"))
                .collect(Collectors.toSet());

        Set<String> expected = Set.of(
                "/api/auth/register", "/api/auth/login", "/api/auth/password-reset/request",
                "/api/auth/password-reset/confirm", "/api/account/profile", "/api/catalog",
                "/api/catalog/{id}", "/api/catalog/page", "/api/catalog/refresh",
                "/api/catalog/refresh-release-progress", "/api/tracks", "/api/tracks/{id}",
                "/api/contact-messages", "/api/contact-messages/{id}/resolve",
                "/api/admin/overview", "/api/admin/users",
                "/api/wishlist", "/api/wishlist/{id}/start", "/api/wishlist/{id}",
                "/api/community/{mediaId}", "/api/community/comments/{id}/reaction",
                "/api/community/comments/{id}/reports", "/api/media/{mediaId}/notes",
                "/api/media/{mediaId}/notes/{id}", "/api/media/{mediaId}/ratings",
                "/api/media/{mediaId}/ratings/{id}", "/api/media/{mediaId}/rating-trends",
                "/api/recommendations", "/api/recommendations/{mediaId}/dismiss",
                "/api/recommendations/preferences"
        );

        assertTrue(paths.containsAll(expected), () -> "Missing API mappings: " + expected.stream()
                .filter(path -> !paths.contains(path)).toList());
    }
}
