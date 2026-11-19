package com.code.DayTracker.services;

import com.code.DayTracker.models.PasswordResetToken;
import com.code.DayTracker.repositories.PasswordResetTokenRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetService.class);
    private final UserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetNotifier notifier;

    public PasswordResetService(UserRepository users, PasswordResetTokenRepository tokens,
                                PasswordEncoder passwordEncoder, PasswordResetNotifier notifier) {
        this.users = users;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.notifier = notifier;
    }

    @Transactional
    public void requestReset(String email) {
        users.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            tokens.deleteAllByUser(user);
            byte[] bytes = new byte[32];
            RANDOM.nextBytes(bytes);
            String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            tokens.save(new PasswordResetToken(user, hash(rawToken), Instant.now().plus(15, ChronoUnit.MINUTES)));
            try {
                notifier.sendResetLink(user.getEmail(), rawToken);
            } catch (RuntimeException exception) {
                LOGGER.error("Password reset delivery failed type={}", exception.getClass().getSimpleName());
            }
        });
    }

    @Transactional
    public void confirmReset(String rawToken, String newPassword) {
        PasswordResetToken token = tokens.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        Instant now = Instant.now();
        if (!token.isUsableAt(now)) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        token.getUser().updatePassword(passwordEncoder.encode(newPassword));
        token.markUsed(now);
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
