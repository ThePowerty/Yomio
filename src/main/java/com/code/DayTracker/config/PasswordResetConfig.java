package com.code.DayTracker.config;

import com.code.DayTracker.services.PasswordResetNotifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Configuration
public class PasswordResetConfig {

    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetConfig.class);

    @Bean
    @ConditionalOnProperty(name = "app.password-reset.smtp-enabled", havingValue = "true")
    PasswordResetNotifier mailPasswordResetNotifier(
            JavaMailSender mailSender,
            @Value("${app.password-reset.from}") String from,
            @Value("${app.password-reset.base-url}") String baseUrl
    ) {
        return (email, token) -> {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(email);
            message.setSubject("Restablecer contraseña de Yomio");
            message.setText("Abre este enlace para restablecer tu contraseña: " + baseUrl + "?token=" + token);
            mailSender.send(message);
        };
    }

    @Bean
    @ConditionalOnProperty(name = "app.password-reset.smtp-enabled", havingValue = "false", matchIfMissing = true)
    PasswordResetNotifier disabledPasswordResetNotifier() {
        return (email, token) -> LOGGER.warn("Password reset requested but SMTP delivery is disabled");
    }
}
