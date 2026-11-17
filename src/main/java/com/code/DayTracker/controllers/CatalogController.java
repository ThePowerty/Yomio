package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.CatalogMediaResponse;
import com.code.DayTracker.dto.CatalogPageResponse;
import com.code.DayTracker.dto.CatalogRefreshResponse;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.services.CatalogService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<CatalogMediaResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) MediaType type,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int limit,
            @RequestParam(defaultValue = "true") boolean importMissing
    ) {
        if (importMissing) {
            return catalogService.searchAndImport(query, type, limit);
        }
        return catalogService.search(query, type, limit);
    }

    @GetMapping("/{id}")
    public CatalogMediaResponse findById(@PathVariable Long id) {
        return catalogService.findById(id);
    }

    @GetMapping("/page")
    public CatalogPageResponse searchPage(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) MediaType type,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "12") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "true") boolean importMissing
    ) {
        if (importMissing) {
            return catalogService.searchAndImportPage(query, type, page, size);
        }
        return catalogService.searchPage(query, type, page, size);
    }

    @PostMapping("/refresh")
    public CatalogRefreshResponse refresh(@RequestParam(required = false) MediaType type) {
        return new CatalogRefreshResponse(type == null
                ? catalogService.refreshCatalog()
                : catalogService.refreshCatalog(type));
    }
}
