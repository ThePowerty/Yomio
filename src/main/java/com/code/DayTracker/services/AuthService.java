package com.code.DayTracker.services;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.dto.RegisterRequest;
import com.code.DayTracker.dto.UserResponse;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        AppUser user = new AppUser(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.role() == null ? Role.USER : request.role()
        );
        AppUser saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(saved), UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (AuthenticationException exception) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        AppUser user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }
}
