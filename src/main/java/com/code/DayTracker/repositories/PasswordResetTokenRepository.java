package com.code.DayTracker.repositories;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.PasswordResetToken;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
    void deleteAllByUser(AppUser user);
}
