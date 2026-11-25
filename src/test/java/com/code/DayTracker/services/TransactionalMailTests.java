package com.code.DayTracker.services;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.integrations.brevo.BrevoMailClient;
import org.junit.jupiter.api.Test;

class TransactionalMailTests {

    private final BrevoMailClient client = mock(BrevoMailClient.class);
    private final TransactionalMail mail = new TransactionalMail(client, Runnable::run,
            "https://example.test/Yomio/reset-password");

    @Test
    void resetLinkPreservesPagesBaseAndKeepsTokenInFragment() {
        when(client.isConfigured()).thenReturn(true);

        mail.reset(new TransactionalMail.PasswordReset("reader@example.test", "test-token"));

        verify(client).send(eq("reader@example.test"), anyString(),
                contains("https://example.test/Yomio/reset-password#token=test-token"));
    }

    @Test
    void welcomeIsSkippedWhenMailIsNotConfigured() {
        mail.welcome(new TransactionalMail.Welcome("reader@example.test"));

        verify(client, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void welcomeDeliveryFailureDoesNotEscapeListener() {
        when(client.isConfigured()).thenReturn(true);
        doThrow(new IllegalStateException("provider failure")).when(client).send(anyString(), anyString(), anyString());

        assertDoesNotThrow(() -> mail.welcome(new TransactionalMail.Welcome("reader@example.test")));
        verify(client).send(eq("reader@example.test"), contains("bienvenida"), anyString());
    }
}
