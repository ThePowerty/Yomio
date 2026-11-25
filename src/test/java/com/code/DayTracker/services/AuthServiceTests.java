package com.code.DayTracker.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.dto.RegisterRequest;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTests {

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;
    private PasswordEncoder passwordEncoder;
    private UserRepository users;
    private ApplicationEventPublisher events;
    private AuthService service;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        jwtService = mock(JwtService.class);
        passwordEncoder = mock(PasswordEncoder.class);
        users = mock(UserRepository.class);
        events = mock(ApplicationEventPublisher.class);
        service = new AuthService(authenticationManager, jwtService, passwordEncoder, users, events);
    }

    @Test
    void publicRegistrationAlwaysCreatesARegularUser() {
        when(passwordEncoder.encode("long-password")).thenReturn("encoded");
        when(users.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(AppUser.class))).thenReturn("jwt");

        service.register(new RegisterRequest("reader", "READER@EXAMPLE.COM", "long-password", true));

        ArgumentCaptor<AppUser> user = ArgumentCaptor.forClass(AppUser.class);
        verify(users).save(user.capture());
        assertEquals(Role.USER, user.getValue().getRole());
        assertEquals("reader@example.com", user.getValue().getEmail());
        verify(events).publishEvent(new TransactionalMail.Welcome("reader@example.com"));
    }

    @Test
    void duplicateRegistrationDoesNotPublishWelcome() {
        when(users.existsByEmail("reader@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> service.register(new RegisterRequest("reader", "reader@example.com", "long-password", true)));

        org.mockito.Mockito.verifyNoInteractions(events);
    }

    @Test
    void loginReturnsTokenForValidCredentials() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded", Role.USER);
        when(users.findByUsername("reader")).thenReturn(java.util.Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt");

        var response = service.login(new LoginRequest("reader", "long-password"));

        assertEquals("jwt", response.token());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void loginKeepsCredentialFailureGeneric() {
        when(authenticationManager.authenticate(any())).thenThrow(mock(AuthenticationException.class));

        assertThrows(BadCredentialsException.class,
                () -> service.login(new LoginRequest("unknown", "long-password")));
    }

    @Test
    void refreshIssuesANewTokenForTheAuthenticatedUser() {
        AppUser user = new AppUser("reader", "reader@example.com", "encoded", Role.USER);
        when(users.findByUsername("reader")).thenReturn(java.util.Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("renewed-jwt");

        var response = service.refresh("reader");

        assertEquals("renewed-jwt", response.token());
        assertEquals("reader", response.user().username());
    }
}
