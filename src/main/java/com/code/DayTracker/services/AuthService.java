package com.code.DayTracker.services;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.dto.RegisterRequest;
import com.code.DayTracker.dto.UserResponse;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import java.util.Locale;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String CURRENT_POLICIES_VERSION = "2026-11-18";

    private final String dummyPasswordHash;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher events;

    public AuthService(
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            ApplicationEventPublisher events
    ) {
        this.dummyPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.events = events;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Unable to create account with these credentials");
        }
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Unable to create account with these credentials");
        }

        AppUser user = new AppUser(
                request.username(),
                normalizedEmail,
                passwordEncoder.encode(request.password()),
                Role.USER
        );
        user.acceptPolicies(CURRENT_POLICIES_VERSION);
        AppUser saved = userRepository.save(user);
        events.publishEvent(new TransactionalMail.Welcome(saved.getEmail()));
        return new AuthResponse(jwtService.generateToken(saved), UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email().trim().toLowerCase(Locale.ROOT)).orElse(null);
        String passwordHash = user == null ? dummyPasswordHash : user.getPassword();
        boolean validPassword = passwordEncoder.matches(request.password(), passwordHash);
        if (!validPassword || user == null) {
            throw new BadCredentialsException("Invalid email or password");
        }
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }
}
