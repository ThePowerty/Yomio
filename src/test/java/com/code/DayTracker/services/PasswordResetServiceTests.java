package com.code.DayTracker.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
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
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class PasswordResetServiceTests {

    private UserRepository users;
    private PasswordResetTokenRepository tokens;
    private PasswordEncoder encoder;
    private PasswordResetNotifier notifier;
    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        tokens = mock(PasswordResetTokenRepository.class);
        encoder = mock(PasswordEncoder.class);
        notifier = mock(PasswordResetNotifier.class);
        service = new PasswordResetService(users, tokens, encoder, notifier);
    }

    @Test
    void requestCreatesHashedExpiringTokenAndDeliversOnlyRawToken() {
        AppUser user = new AppUser("reader", "reader@example.com", "old", Role.USER);
        when(users.findByEmail("reader@example.com")).thenReturn(Optional.of(user));

        service.requestReset("READER@EXAMPLE.COM");

        verify(tokens).deleteAllByUser(user);
        verify(tokens).save(any(PasswordResetToken.class));
        verify(notifier).sendResetLink(org.mockito.ArgumentMatchers.eq("reader@example.com"), anyString());
    }

    @Test
    void requestDoesNotRevealUnknownEmail() {
        service.requestReset("missing@example.com");

        verify(tokens, never()).save(any());
        verify(notifier, never()).sendResetLink(anyString(), anyString());
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
