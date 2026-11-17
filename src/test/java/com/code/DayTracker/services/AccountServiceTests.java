package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.ProfileUpdateRequest;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class AccountServiceTests {

    @Test
    void updatesProfileAndIssuesTokenForTheUpdatedUsername() {
        UserRepository repository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        AppUser user = new AppUser("old-name", "old@example.com", "hash", Role.USER);
        when(repository.findByUsername("old-name")).thenReturn(Optional.of(user));
        when(repository.save(user)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("new-token");
        AccountService service = new AccountService(repository, jwtService);

        AuthResponse response = service.updateProfile(
                "old-name",
                new ProfileUpdateRequest("new-name", "NEW@EXAMPLE.COM")
        );

        assertThat(response.token()).isEqualTo("new-token");
        assertThat(response.user().username()).isEqualTo("new-name");
        assertThat(response.user().email()).isEqualTo("new@example.com");
        verify(repository).save(user);
        verify(jwtService).generateToken(user);
    }

    @Test
    void rejectsAnEmailOwnedByAnotherAccount() {
        UserRepository repository = mock(UserRepository.class);
        JwtService jwtService = mock(JwtService.class);
        AppUser user = new AppUser("reader", "reader@example.com", "hash", Role.USER);
        when(repository.findByUsername("reader")).thenReturn(Optional.of(user));
        when(repository.existsByEmailAndIdNot("used@example.com", null)).thenReturn(true);
        AccountService service = new AccountService(repository, jwtService);

        assertThatThrownBy(() -> service.updateProfile(
                "reader",
                new ProfileUpdateRequest("reader", "used@example.com")
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Email already exists");
    }
}
