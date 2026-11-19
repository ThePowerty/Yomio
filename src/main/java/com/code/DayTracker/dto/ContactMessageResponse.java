package com.code.DayTracker.dto;

import com.code.DayTracker.models.ContactCategory;
import com.code.DayTracker.models.ContactMessage;
import java.time.Instant;

public record ContactMessageResponse(Long id, String username, ContactCategory category, String subject,
                                     String message, Instant createdAt, Instant resolvedAt) {
    public static ContactMessageResponse from(ContactMessage value) {
        return new ContactMessageResponse(value.getId(), value.getUser().getUsername(), value.getCategory(),
                value.getSubject(), value.getMessage(), value.getCreatedAt(), value.getResolvedAt());
    }
}
