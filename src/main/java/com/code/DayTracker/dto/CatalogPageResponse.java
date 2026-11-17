package com.code.DayTracker.dto;

import java.util.List;

public record CatalogPageResponse(
        List<CatalogMediaResponse> items,
        int page,
        int size,
        long totalItems,
        int totalPages
) {
}
