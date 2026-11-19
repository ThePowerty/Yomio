package com.code.DayTracker.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import org.junit.jupiter.api.Test;

class JwtServiceTests {

    private final JwtService jwt = new JwtService("test-secret-with-at-least-32-bytes-long", 60_000);

    @Test
    void passwordChangeInvalidatesPreviouslyIssuedToken() {
        AppUser user = new AppUser("reader", "reader@example.com", "old-encoded-password", Role.USER);
        String token = jwt.generateToken(user);

        assertTrue(jwt.isTokenValid(token, user));

        user.updatePassword("new-encoded-password");
        assertFalse(jwt.isTokenValid(token, user));
    }

    @Test
    void malformedTokenIsRejectedWithoutThrowing() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded-password", Role.USER);

        assertFalse(jwt.isTokenValid("not-a-jwt", user));
    }
}
