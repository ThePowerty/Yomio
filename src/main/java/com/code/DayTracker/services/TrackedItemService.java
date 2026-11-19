package com.code.DayTracker.services;

import com.code.DayTracker.dto.TrackedItemRequest;
import com.code.DayTracker.dto.TrackedItemResponse;
import com.code.DayTracker.dto.WishlistItemRequest;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.repositories.TrackedItemRepository;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.repositories.CatalogMediaRepository;
import com.code.DayTracker.models.CatalogMedia;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrackedItemService {

    private final TrackedItemRepository trackedItemRepository;
    private final UserRepository userRepository;
    private final CatalogMediaRepository catalogMediaRepository;

    public TrackedItemService(TrackedItemRepository trackedItemRepository, UserRepository userRepository, CatalogMediaRepository catalogMediaRepository) {
        this.trackedItemRepository = trackedItemRepository;
        this.userRepository = userRepository;
        this.catalogMediaRepository = catalogMediaRepository;
    }

    @Transactional(readOnly = true)
    public List<TrackedItemResponse> findAll(String username) {
        return trackedItemRepository.findAllByUserUsernameAndReadingStatusNotOrderByUpdatedAtDesc(username, ReadingStatus.PLAN_TO_READ)
                .stream()
                .map(TrackedItemResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TrackedItemResponse findById(Long id, String username) {
        return TrackedItemResponse.from(findOwnedItem(id, username));
    }

    @Transactional(readOnly = true)
    public List<TrackedItemResponse> findWishlist(String username) {
        return trackedItemRepository.findAllByUserUsernameAndReadingStatusOrderByUpdatedAtDesc(username, ReadingStatus.PLAN_TO_READ)
                .stream().map(TrackedItemResponse::from).toList();
    }

    @Transactional
    public TrackedItemResponse create(TrackedItemRequest request, String username) {
        rejectWishlistStatus(request.readingStatus());
        validateProgress(request);
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        CatalogMedia catalogMedia = resolveCatalogMedia(request.catalogMediaId());
        if (catalogMedia != null && trackedItemRepository.findByCatalogMediaIdAndUserUsername(catalogMedia.getId(), username).isPresent()) {
            throw new IllegalArgumentException("This title is already in your library");
        }
        String title = catalogMedia == null ? request.title() : firstNonBlank(catalogMedia.getTitleLocalized(), catalogMedia.getTitle());
        var type = catalogMedia == null ? request.type() : catalogMedia.getType();
        Integer total = catalogMedia == null ? request.totalChapters() : (type == com.code.DayTracker.models.MediaType.ANIME || type == com.code.DayTracker.models.MediaType.MOVIE ? catalogMedia.getEpisodes() : catalogMedia.getChapters());
        validateLifecycleStatus(catalogMedia, request.readingStatus(), request.currentChapter());
        validatePublishedProgress(catalogMedia, total, request.currentChapter(), request.readingStatus());
        TrackedItem item = new TrackedItem(
                title,
                type,
                request.currentChapter(),
                total,
                request.readingStatus(),
                request.score(),
                request.readingStatus() == ReadingStatus.COMPLETED,
                request.notes(),
                user,
                catalogMedia,
                request.favorite()
        );
        return TrackedItemResponse.from(trackedItemRepository.save(item));
    }

    @Transactional
    public TrackedItemResponse update(Long id, TrackedItemRequest request, String username) {
        rejectWishlistStatus(request.readingStatus());
        TrackedItem item = findOwnedItem(id, username);
        CatalogMedia catalogMedia = request.catalogMediaId() == null ? item.getCatalogMedia() : resolveCatalogMedia(request.catalogMediaId());
        Integer total = catalogMedia == null ? request.totalChapters()
                : (catalogMedia.getType() == com.code.DayTracker.models.MediaType.ANIME
                || catalogMedia.getType() == com.code.DayTracker.models.MediaType.MOVIE
                ? catalogMedia.getEpisodes() : catalogMedia.getChapters());
        validateProgress(request.currentChapter(), total, request.readingStatus());
        validateLifecycleStatus(catalogMedia, request.readingStatus(), request.currentChapter());
        validatePublishedProgress(catalogMedia, total, request.currentChapter(), request.readingStatus());
        item.update(
                request.title(),
                request.type(),
                request.currentChapter(),
                total,
                request.readingStatus(),
                request.score(),
                request.readingStatus() == ReadingStatus.COMPLETED,
                request.notes(),
                catalogMedia,
                request.favorite()
        );
        return TrackedItemResponse.from(item);
    }

    @Transactional
    public void delete(Long id, String username) {
        trackedItemRepository.delete(findOwnedItem(id, username));
    }

    @Transactional
    public TrackedItemResponse addToWishlist(WishlistItemRequest request, String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        CatalogMedia catalogMedia = resolveCatalogMedia(request.catalogMediaId());
        if (trackedItemRepository.findByCatalogMediaIdAndUserUsername(catalogMedia.getId(), username).isPresent()) {
            throw new IllegalArgumentException("This title is already in your library");
        }
        String title = firstNonBlank(catalogMedia.getTitleLocalized(), catalogMedia.getTitle());
        var type = catalogMedia.getType();
        Integer total = type == com.code.DayTracker.models.MediaType.ANIME || type == com.code.DayTracker.models.MediaType.MOVIE
                ? catalogMedia.getEpisodes() : catalogMedia.getChapters();
        TrackedItem item = new TrackedItem(
                title, type, 0, total, ReadingStatus.PLAN_TO_READ, null, false, null,
                user, catalogMedia, request.favorite()
        );
        return TrackedItemResponse.from(trackedItemRepository.save(item));
    }

    @Transactional
    public TrackedItemResponse startWishlistItem(Long id, String username) {
        TrackedItem item = findOwnedWishlistItem(id, username);
        item.update(
                item.getTitle(), item.getType(), 0, item.getTotalChapters(), ReadingStatus.READING,
                null, false, item.getNotes(), item.getCatalogMedia(), item.isFavorite()
        );
        return TrackedItemResponse.from(item);
    }

    @Transactional
    public void deleteWishlistItem(Long id, String username) {
        trackedItemRepository.delete(findOwnedWishlistItem(id, username));
    }

    private TrackedItem findOwnedItem(Long id, String username) {
        return trackedItemRepository.findByIdAndUserUsername(id, username)
                .orElseThrow(() -> new IllegalArgumentException("Tracked item not found"));
    }

    private TrackedItem findOwnedWishlistItem(Long id, String username) {
        TrackedItem item = findOwnedItem(id, username);
        if (item.getReadingStatus() != ReadingStatus.PLAN_TO_READ) {
            throw new IllegalArgumentException("Wishlist item not found");
        }
        return item;
    }

    private void rejectWishlistStatus(ReadingStatus status) {
        if (status == ReadingStatus.PLAN_TO_READ) {
            throw new IllegalArgumentException("Use the wishlist workflow for pending titles");
        }
    }

    private void validateProgress(TrackedItemRequest request) {
        validateProgress(request.currentChapter(), request.totalChapters(), request.readingStatus());
    }

    private void validateProgress(Integer current, Integer total, ReadingStatus status) {
        if (total != null && current > total) {
            throw new IllegalArgumentException("Read chapters cannot exceed total chapters");
        }
        if (status == ReadingStatus.COMPLETED && total != null && !current.equals(total)) {
            throw new IllegalArgumentException("Completed titles must be registered at their final chapter or episode");
        }
    }

    private CatalogMedia resolveCatalogMedia(Long id) {
        if (id == null) return null;
        return catalogMediaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catalog title not found"));
    }

    private String firstNonBlank(String... values) {
        for (String value : values) if (value != null && !value.isBlank()) return value;
        return "Untitled";
    }

    private void validatePublishedProgress(CatalogMedia media, Integer total, Integer current, ReadingStatus status) {
        if (isReleasing(media) && media.getLatestReleasedUnit() != null && current > media.getLatestReleasedUnit()) {
            throw new IllegalArgumentException("Progress cannot exceed the latest published chapter or episode");
        }
    }

    private void validateLifecycleStatus(CatalogMedia media, ReadingStatus status, Integer current) {
        if (status == ReadingStatus.COMPLETED && isReleasing(media)) {
            throw new IllegalArgumentException("Titles in release must use the up-to-date status instead of completed");
        }
        if (status != ReadingStatus.UP_TO_DATE) return;
        if (!isReleasing(media)) {
            throw new IllegalArgumentException("Up-to-date status is only available for titles in release");
        }
        if (media.getLatestReleasedUnit() == null || !current.equals(media.getLatestReleasedUnit())) {
            throw new IllegalArgumentException("Up-to-date titles must use the latest published chapter or episode");
        }
    }

    private boolean isReleasing(CatalogMedia media) {
        return media != null && "RELEASING".equalsIgnoreCase(media.getStatus());
    }
}
