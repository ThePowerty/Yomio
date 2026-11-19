package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.TrackedItemResponse;
import com.code.DayTracker.dto.WishlistItemRequest;
import com.code.DayTracker.services.TrackedItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final TrackedItemService trackedItemService;

    public WishlistController(TrackedItemService trackedItemService) {
        this.trackedItemService = trackedItemService;
    }

    @GetMapping
    public List<TrackedItemResponse> findAll(Authentication authentication) {
        return trackedItemService.findWishlist(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrackedItemResponse create(@Valid @RequestBody WishlistItemRequest request, Authentication authentication) {
        return trackedItemService.addToWishlist(request, authentication.getName());
    }

    @PatchMapping("/{id}/start")
    public TrackedItemResponse start(@PathVariable Long id, Authentication authentication) {
        return trackedItemService.startWishlistItem(id, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        trackedItemService.deleteWishlistItem(id, authentication.getName());
    }
}
