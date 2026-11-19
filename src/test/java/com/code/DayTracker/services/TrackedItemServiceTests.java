package com.code.DayTracker.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.dto.TrackedItemRequest;
import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.repositories.CatalogMediaRepository;
import com.code.DayTracker.repositories.TrackedItemRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TrackedItemServiceTests {

    private TrackedItemRepository tracks;
    private UserRepository users;
    private CatalogMediaRepository catalog;
    private TrackedItemService service;

    @BeforeEach
    void setUp() {
        tracks = mock(TrackedItemRepository.class);
        users = mock(UserRepository.class);
        catalog = mock(CatalogMediaRepository.class);
        service = new TrackedItemService(tracks, users, catalog);
    }

    @Test
    void activeTrackingExcludesWishlistItems() {
        when(tracks.findAllByUserUsernameAndReadingStatusNotOrderByUpdatedAtDesc("reader", ReadingStatus.PLAN_TO_READ))
                .thenReturn(List.of());

        assertEquals(List.of(), service.findAll("reader"));

        verify(tracks).findAllByUserUsernameAndReadingStatusNotOrderByUpdatedAtDesc("reader", ReadingStatus.PLAN_TO_READ);
    }

    @Test
    void startingWishlistItemMovesItToActiveTracking() {
        CatalogMedia media = mock(CatalogMedia.class);
        TrackedItem item = new TrackedItem("Title", MediaType.MANGA, 0, 20, ReadingStatus.PLAN_TO_READ,
                null, false, null, mock(com.code.DayTracker.models.AppUser.class), media, false);
        when(tracks.findByIdAndUserUsername(4L, "reader")).thenReturn(Optional.of(item));

        var response = service.startWishlistItem(4L, "reader");

        assertEquals(ReadingStatus.READING, response.readingStatus());
        assertEquals(0, response.currentChapter());
    }

    @Test
    void trackingEndpointRejectsPendingStatus() {
        var request = new TrackedItemRequest(null, "Title", MediaType.MANGA, 0, null,
                ReadingStatus.PLAN_TO_READ, null, false, null, false);

        assertThrows(IllegalArgumentException.class, () -> service.create(request, "reader"));
    }

    @Test
    void userCannotReadAnotherUsersTrackedItem() {
        when(tracks.findByIdAndUserUsername(42L, "reader-a")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> service.findById(42L, "reader-a"));

        verify(tracks).findByIdAndUserUsername(42L, "reader-a");
    }

    @Test
    void completedTitleMustUseItsFinalKnownUnit() {
        var request = new TrackedItemRequest(null, "Title", MediaType.ANIME, 8, 12,
                ReadingStatus.COMPLETED, 9, true, "Good", false);

        assertThrows(IllegalArgumentException.class, () -> service.create(request, "reader"));
    }

    @Test
    void releasingTitleUsesUpToDateInsteadOfCompleted() {
        CatalogMedia media = mock(CatalogMedia.class);
        when(media.getId()).thenReturn(7L);
        when(media.getType()).thenReturn(MediaType.MANGA);
        when(media.getTitle()).thenReturn("Ongoing title");
        when(media.getStatus()).thenReturn("RELEASING");
        when(media.getLatestReleasedUnit()).thenReturn(12);
        when(users.findByUsername("reader")).thenReturn(Optional.of(mock(AppUser.class)));
        when(catalog.findById(7L)).thenReturn(Optional.of(media));
        when(tracks.findByCatalogMediaIdAndUserUsername(7L, "reader")).thenReturn(Optional.empty());
        when(tracks.save(any(TrackedItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var upToDate = new TrackedItemRequest(7L, "Ignored", MediaType.MANGA, 12, null,
                ReadingStatus.UP_TO_DATE, 8, false, null, false);
        var completed = new TrackedItemRequest(7L, "Ignored", MediaType.MANGA, 12, null,
                ReadingStatus.COMPLETED, 8, true, null, false);
        var behindLatest = new TrackedItemRequest(7L, "Ignored", MediaType.MANGA, 11, null,
                ReadingStatus.UP_TO_DATE, 8, false, null, false);

        assertEquals(ReadingStatus.UP_TO_DATE, service.create(upToDate, "reader").readingStatus());
        assertThrows(IllegalArgumentException.class, () -> service.create(completed, "reader"));
        assertThrows(IllegalArgumentException.class, () -> service.create(behindLatest, "reader"));
    }
}
