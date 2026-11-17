package com.code.DayTracker.services;

import com.code.DayTracker.dto.TrackedItemRequest;
import com.code.DayTracker.dto.TrackedItemResponse;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.repositories.TrackedItemRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrackedItemService {

    private final TrackedItemRepository trackedItemRepository;
    private final UserRepository userRepository;

    public TrackedItemService(TrackedItemRepository trackedItemRepository, UserRepository userRepository) {
        this.trackedItemRepository = trackedItemRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TrackedItemResponse> findAll(String username) {
        return trackedItemRepository.findAllByUserUsernameOrderByUpdatedAtDesc(username)
                .stream()
                .map(TrackedItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrackedItemResponse findById(Long id, String username) {
        return TrackedItemResponse.from(findOwnedItem(id, username));
    }

    @Transactional
    public TrackedItemResponse create(TrackedItemRequest request, String username) {
        validateProgress(request);
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        TrackedItem item = new TrackedItem(
                request.title(),
                request.type(),
                request.currentChapter(),
                request.totalChapters(),
                request.readingStatus(),
                request.score(),
                request.readingStatus() == ReadingStatus.COMPLETED,
                request.notes(),
                user
        );
        return TrackedItemResponse.from(trackedItemRepository.save(item));
    }

    @Transactional
    public TrackedItemResponse update(Long id, TrackedItemRequest request, String username) {
        validateProgress(request);
        TrackedItem item = findOwnedItem(id, username);
        item.update(
                request.title(),
                request.type(),
                request.currentChapter(),
                request.totalChapters(),
                request.readingStatus(),
                request.score(),
                request.readingStatus() == ReadingStatus.COMPLETED,
                request.notes()
        );
        return TrackedItemResponse.from(item);
    }

    @Transactional
    public void delete(Long id, String username) {
        trackedItemRepository.delete(findOwnedItem(id, username));
    }

    private TrackedItem findOwnedItem(Long id, String username) {
        return trackedItemRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Tracked item not found"));
    }

    private void validateProgress(TrackedItemRequest request) {
        if (request.totalChapters() != null && request.currentChapter() > request.totalChapters()) {
            throw new IllegalArgumentException("Read chapters cannot exceed total chapters");
        }
    }
}
