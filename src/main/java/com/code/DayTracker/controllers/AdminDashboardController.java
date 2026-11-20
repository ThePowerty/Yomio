package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.AdminOverviewResponse;
import com.code.DayTracker.dto.AdminUserPageResponse;
import com.code.DayTracker.dto.AdminRoleUpdateRequest;
import com.code.DayTracker.dto.AdminUserProgressResponse;
import com.code.DayTracker.dto.AdminUserResponse;
import com.code.DayTracker.services.AdminDashboardService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

@Validated
@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService dashboard;

    public AdminDashboardController(AdminDashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/overview")
    public AdminOverviewResponse overview() {
        return dashboard.overview();
    }

    @GetMapping("/users")
    public AdminUserPageResponse users(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size
    ) {
        return dashboard.users(query, page, size);
    }

    @GetMapping("/users/{userId}/progress")
    public AdminUserProgressResponse progress(@PathVariable Long userId) {
        return dashboard.progress(userId);
    }

    @PatchMapping("/users/{userId}/role")
    public AdminUserResponse updateRole(
            @PathVariable Long userId,
            @Valid @RequestBody AdminRoleUpdateRequest request,
            Authentication authentication
    ) {
        return dashboard.updateRole(userId, request.role(), authentication.getName());
    }
}
