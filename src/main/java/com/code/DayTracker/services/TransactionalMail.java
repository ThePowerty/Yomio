package com.code.DayTracker.services;

import com.code.DayTracker.integrations.brevo.BrevoMailClient;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

@Component
class TransactionalMail {

    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionalMail.class);
    private final BrevoMailClient client;
    private final Executor executor;
    private final String resetUrl;

    TransactionalMail(BrevoMailClient client, @Qualifier("transactionalMailExecutor") Executor executor,
                      @Value("${app.password-reset.base-url}") String resetUrl) {
        this.client = client;
        this.executor = executor;
        this.resetUrl = resetUrl;
    }

    record Welcome(String email) {}
    record PasswordReset(String email, String token) {}

    @TransactionalEventListener
    void welcome(Welcome event) {
        enqueue("welcome", event.email(), "Te damos la bienvenida a Yomio",
                "Tu cuenta ya está lista. Entra en Yomio para guardar tus pendientes y registrar tu progreso.");
    }

    @TransactionalEventListener
    void reset(PasswordReset event) {
        String link = UriComponentsBuilder.fromUriString(resetUrl)
                .fragment("token=" + event.token()).build().toUriString();
        enqueue("password_reset", event.email(), "Restablece tu contraseña de Yomio",
                "Abre este enlace para elegir una nueva contraseña:\n\n" + link
                        + "\n\nEl enlace caduca en 15 minutos y solo se puede usar una vez."
                        + " Si no lo solicitaste, puedes ignorar este correo.");
    }

    private void enqueue(String type, String email, String subject, String text) {
        if (!client.isConfigured()) {
            LOGGER.debug("Transactional email disabled type={}", type);
            return;
        }
        try {
            executor.execute(() -> {
                try {
                    client.send(email, subject, text);
                } catch (RestClientResponseException exception) {
                    LOGGER.warn("Brevo rejected transactional email type={} status={}", type, exception.getStatusCode().value());
                } catch (RuntimeException exception) {
                    LOGGER.warn("Transactional email delivery failed type={}", type);
                }
            });
        } catch (RejectedExecutionException exception) {
            LOGGER.warn("Transactional email queue unavailable type={}", type);
        }
    }
}
