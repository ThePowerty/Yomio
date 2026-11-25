package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.dto.RegisterRequest;
import com.code.DayTracker.dto.PasswordResetRequest;
import com.code.DayTracker.dto.PasswordResetConfirmRequest;
import com.code.DayTracker.services.AuthService;
import com.code.DayTracker.services.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(Authentication authentication) {
        return authService.refresh(authentication.getName());
    }

    @PostMapping("/password-reset/request")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.requestReset(request.email());
    }

    @PostMapping("/password-reset/account")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestAccountPasswordReset(Authentication authentication) {
        passwordResetService.requestAccountReset(authentication.getName());
    }

    @PostMapping("/password-reset/confirm")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.confirmReset(request.token(), request.password());
    }
}
