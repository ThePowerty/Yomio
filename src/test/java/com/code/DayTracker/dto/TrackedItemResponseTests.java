package com.code.DayTracker.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.models.TrackedItem;
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
}
