package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.dto.ContactMessageRequest;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.ContactCategory;
import com.code.DayTracker.models.ContactMessage;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.ContactMessageRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;

class ContactMessageServiceTests {

    private ContactMessageRepository messages;
    private UserRepository users;
    private ContactMessageService service;
    private AppUser user;

    @BeforeEach
    void setUp() {
        messages = mock(ContactMessageRepository.class);
        users = mock(UserRepository.class);
        service = new ContactMessageService(messages, users);
        user = new AppUser("reader", "reader@example.test", "hash", Role.USER);
    }

    @Test
    void createsMessageForAuthenticatedUsernameAndTrimsContent() {
        when(users.findByUsername("reader")).thenReturn(Optional.of(user));
        when(messages.save(any(ContactMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.create("reader", new ContactMessageRequest(
                ContactCategory.IMPROVEMENT, "  Mejor calendario  ", "  Añadir vista semanal  "
        ));

        assertThat(result.username()).isEqualTo("reader");
        assertThat(result.subject()).isEqualTo("Mejor calendario");
        assertThat(result.message()).isEqualTo("Añadir vista semanal");
        verify(users).findByUsername("reader");
    }

    @Test
    void adminListIsBoundedAndResolveIsIdempotent() {
        ContactMessage message = new ContactMessage(user, ContactCategory.COMPLAINT, "Asunto", "Detalle");
        when(messages.findAllForAdmin(PageRequest.of(0, 100))).thenReturn(List.of(message));
        when(messages.findById(7L)).thenReturn(Optional.of(message));

        assertThat(service.list()).hasSize(1);
        var first = service.resolve(7L);
        var second = service.resolve(7L);

        assertThat(first.resolvedAt()).isNotNull();
        assertThat(second.resolvedAt()).isEqualTo(first.resolvedAt());
    }
}
