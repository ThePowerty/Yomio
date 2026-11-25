package com.code.DayTracker.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.PasswordResetToken;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.PasswordResetTokenRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

class PasswordResetServiceTests {

    private UserRepository users;
    private PasswordResetTokenRepository tokens;
    private PasswordEncoder encoder;
    private ApplicationEventPublisher events;
    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        tokens = mock(PasswordResetTokenRepository.class);
        encoder = mock(PasswordEncoder.class);
        events = mock(ApplicationEventPublisher.class);
        service = new PasswordResetService(users, tokens, encoder, events);
    }

    @Test
    void requestCreatesHashedExpiringTokenAndDeliversOnlyRawToken() throws Exception {
        AppUser user = new AppUser("reader", "reader@example.com", "old", Role.USER);
        when(users.findByEmail("reader@example.com")).thenReturn(Optional.of(user));

        service.requestReset("READER@EXAMPLE.COM");

        verify(tokens).deleteAllByUser(user);
        var token = ArgumentCaptor.forClass(PasswordResetToken.class);
        var delivery = ArgumentCaptor.forClass(TransactionalMail.PasswordReset.class);
        verify(tokens).save(token.capture());
        verify(events).publishEvent(delivery.capture());
        assertEquals("reader@example.com", delivery.getValue().email());
        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(delivery.getValue().token().getBytes(StandardCharsets.UTF_8)));
        assertEquals(hash, ReflectionTestUtils.getField(token.getValue(), "tokenHash"));
    }

    @Test
    void requestDoesNotRevealUnknownEmail() {
        service.requestReset("missing@example.com");

        verify(tokens, never()).save(any());
        org.mockito.Mockito.verifyNoInteractions(events);
    }

    @Test
    void confirmationChangesPasswordAndConsumesToken() {
        AppUser user = new AppUser("reader", "reader@example.com", "old", Role.USER);
        PasswordResetToken token = new PasswordResetToken(user, "hash", Instant.now().plusSeconds(300));
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(encoder.encode("new-password")).thenReturn("new-encoded");

        service.confirmReset("raw-token", "new-password");

        verify(encoder).encode("new-password");
        assertFalse(token.isUsableAt(Instant.now()));
    }
}
