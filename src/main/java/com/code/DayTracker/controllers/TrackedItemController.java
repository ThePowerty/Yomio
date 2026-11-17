package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.TrackedItemRequest;
import com.code.DayTracker.dto.TrackedItemResponse;
import com.code.DayTracker.services.TrackedItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tracks")
public class TrackedItemController {

    private final TrackedItemService trackedItemService;

    public TrackedItemController(TrackedItemService trackedItemService) {
        this.trackedItemService = trackedItemService;
    }

    @GetMapping
    public List<TrackedItemResponse> findAll(Authentication authentication) {
        return trackedItemService.findAll(authentication.getName());
    }

    @GetMapping("/{id}")
    public TrackedItemResponse findById(@PathVariable Long id, Authentication authentication) {
        return trackedItemService.findById(id, authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrackedItemResponse create(@Valid @RequestBody TrackedItemRequest request, Authentication authentication) {
        return trackedItemService.create(request, authentication.getName());
    }

    @PutMapping("/{id}")
    public TrackedItemResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TrackedItemRequest request,
            Authentication authentication
    ) {
        return trackedItemService.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        trackedItemService.delete(id, authentication.getName());
    }
}
