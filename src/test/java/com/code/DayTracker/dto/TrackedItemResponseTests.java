package com.code.DayTracker.dto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.models.TrackedItem;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class TrackedItemResponseTests {

    @Test
    void exposesReadingStatusAndCalculatedProgress() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded", Role.USER);
        TrackedItem item = new TrackedItem(
                "Solo Leveling",
                MediaType.MANHWA,
                50,
                100,
                ReadingStatus.READING,
                null,
                false,
                null,
                user
        );

        TrackedItemResponse response = TrackedItemResponse.from(item);

        assertThat(response.type()).isEqualTo(MediaType.MANHWA);
        assertThat(response.readingStatus()).isEqualTo(ReadingStatus.READING);
        assertThat(response.progress()).isEqualTo(50);
    }

    @Test
    void convertsUpToDateToCompletedWhenCatalogTitleFinishes() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded", Role.USER);
        CatalogMedia media = mock(CatalogMedia.class);
        when(media.getStatus()).thenReturn("FINISHED");
        TrackedItem item = new TrackedItem(
                "Finished title", MediaType.MANGA, 12, 12, ReadingStatus.UP_TO_DATE,
                9, false, null, user, media, false
        );

        TrackedItemResponse response = TrackedItemResponse.from(item);

        assertThat(response.readingStatus()).isEqualTo(ReadingStatus.COMPLETED);
        assertThat(response.finished()).isTrue();
    }

    @Test
    void calculatesOpenTitleProgressFromLatestReleasedUnit() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded", Role.USER);
        CatalogMedia media = mock(CatalogMedia.class);
        when(media.getStatus()).thenReturn("RELEASING");
        when(media.getLatestReleasedUnit()).thenReturn(1198);
        Instant nextRelease = Instant.parse("2026-11-22T18:00:00Z");
        when(media.getNextReleaseAt()).thenReturn(nextRelease);
        TrackedItem item = new TrackedItem(
                "One Piece", MediaType.MANGA, 1198, null, ReadingStatus.UP_TO_DATE,
                9, false, null, user, media, false
        );

        TrackedItemResponse response = TrackedItemResponse.from(item);

        assertThat(response.progress()).isEqualTo(100);
        assertThat(response.nextReleaseAt()).isEqualTo(nextRelease);
    }
}
