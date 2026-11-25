package com.code.DayTracker.integrations.brevo;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class BrevoMailClient {

    private final RestClient client;
    private final String sender;
    private final boolean configured;

    public BrevoMailClient(RestClient.Builder builder,
                           @Value("${app.mail.brevo-api-key}") String apiKey,
                           @Value("${app.mail.from}") String sender) {
        this.sender = sender.trim();
        this.configured = !apiKey.isBlank() && !this.sender.isEmpty();
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        client = builder.clone()
                .baseUrl("https://api.brevo.com")
                .requestFactory(factory)
                .defaultHeader("api-key", apiKey.trim())
                .build();
    }

    public boolean isConfigured() {
        return configured;
    }

    public void send(String recipient, String subject, String text) {
        client.post()
                .uri("/v3/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "sender", Map.of("name", "Yomio", "email", sender),
                        "to", List.of(Map.of("email", recipient)),
                        "subject", subject,
                        "textContent", text))
                .retrieve()
                .toBodilessEntity();
    }
}
