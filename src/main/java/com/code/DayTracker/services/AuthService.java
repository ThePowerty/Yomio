package com.code.DayTracker.services;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.dto.RegisterRequest;
import com.code.DayTracker.dto.UserResponse;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String CURRENT_POLICIES_VERSION = "2026-11-18";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher events;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            ApplicationEventPublisher events
    ) {
        this.authenticationManager = authenticationManager;
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
        String normalizedEmail = request.email().trim().toLowerCase(java.util.Locale.ROOT);
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
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (AuthenticationException exception) {
            throw new BadCredentialsException("Invalid username or password");
        }

        AppUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Authentication required"));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }
}
