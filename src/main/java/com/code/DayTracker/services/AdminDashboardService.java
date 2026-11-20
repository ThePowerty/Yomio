package com.code.DayTracker.services;

import com.code.DayTracker.dto.AdminOverviewResponse;
import com.code.DayTracker.dto.AdminUserPageResponse;
import com.code.DayTracker.dto.AdminUserResponse;
import com.code.DayTracker.dto.AdminProgressGroupResponse;
import com.code.DayTracker.dto.AdminUserProgressResponse;
import com.code.DayTracker.exceptions.ConflictException;
import com.code.DayTracker.exceptions.ResourceNotFoundException;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.repositories.ContactMessageRepository;
import com.code.DayTracker.repositories.TrackedItemRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.EnumSet;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

    private final UserRepository users;
    private final ContactMessageRepository messages;
    private final TrackedItemRepository trackedItems;

    public AdminDashboardService(UserRepository users, ContactMessageRepository messages, TrackedItemRepository trackedItems) {
        this.users = users;
        this.messages = messages;
        this.trackedItems = trackedItems;
    }

    @Transactional(readOnly = true)
    public AdminOverviewResponse overview() {
        long totalUsers = users.count();
        long adminUsers = users.countByRole(Role.ADMIN);
        return new AdminOverviewResponse(
                totalUsers,
                totalUsers - adminUsers,
                adminUsers,
                messages.count(),
                messages.countByResolvedAtIsNull()
        );
    }

    @Transactional(readOnly = true)
    public AdminUserPageResponse users(String query, int page, int size) {
        var pageRequest = PageRequest.of(page, size);
        String normalizedQuery = query == null ? "" : query.trim();
        var result = normalizedQuery.isEmpty()
                ? users.findAllForAdmin(pageRequest)
                : users.searchForAdmin(normalizedQuery, pageRequest);
        return new AdminUserPageResponse(
                result.getContent().stream().map(AdminUserResponse::from).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public AdminUserProgressResponse progress(Long userId) {
        if (!users.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }
        var items = trackedItems.findAllByUserIdAndReadingStatusNot(userId, ReadingStatus.PLAN_TO_READ);
        int activeTitles = (int) items.stream()
                .filter(item -> EnumSet.of(ReadingStatus.READING, ReadingStatus.UP_TO_DATE)
                        .contains(item.getReadingStatus()))
                .count();
        int completedTitles = (int) items.stream().filter(this::isCompleted).count();
        return new AdminUserProgressResponse(
                userId,
                items.size(),
                activeTitles,
                completedTitles,
                summarize(items, EnumSet.of(MediaType.ANIME, MediaType.MOVIE)),
                summarize(items, EnumSet.of(MediaType.MANGA, MediaType.MANHWA))
        );
    }

    @Transactional
    public AdminUserResponse updateRole(Long userId, Role role, String administratorUsername) {
        var lockedUsers = users.findAllForRoleUpdate();
        var target = lockedUsers.stream()
                .filter(account -> account.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (target.getUsername().equals(administratorUsername)) {
            throw new ConflictException("You cannot change your own role");
        }
        if (target.getRole() == Role.ADMIN && role != Role.ADMIN) {
            long administrators = lockedUsers.stream().filter(account -> account.getRole() == Role.ADMIN).count();
            if (administrators <= 1) {
                throw new ConflictException("The last administrator cannot be demoted");
            }
        }
        target.updateRole(role);
        return AdminUserResponse.from(target);
    }

    private AdminProgressGroupResponse summarize(List<TrackedItem> items, EnumSet<MediaType> types) {
        var selected = items.stream().filter(item -> types.contains(item.getType())).toList();
        long currentUnits = selected.stream().mapToLong(item -> safeUnit(item.getCurrentChapter())).sum();
        long knownCurrentUnits = selected.stream()
                .filter(item -> item.getTotalChapters() != null)
                .mapToLong(item -> safeUnit(item.getCurrentChapter()))
                .sum();
        long knownTotalUnits = selected.stream()
                .filter(item -> item.getTotalChapters() != null)
                .mapToLong(item -> safeUnit(item.getTotalChapters()))
                .sum();
        return new AdminProgressGroupResponse(
                selected.size(),
                (int) selected.stream().filter(this::isCompleted).count(),
                currentUnits,
                knownCurrentUnits,
                knownTotalUnits
        );
    }

    private boolean isCompleted(TrackedItem item) {
        return item.getReadingStatus() == ReadingStatus.COMPLETED || item.isFinished();
    }

    private int safeUnit(Integer value) {
        return value == null ? 0 : Math.max(0, value);
    }
}
