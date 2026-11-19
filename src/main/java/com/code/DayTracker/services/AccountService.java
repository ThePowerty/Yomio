package com.code.DayTracker.services;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.ProfileUpdateRequest;
import com.code.DayTracker.dto.UserResponse;
import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.repositories.UserRepository;
import com.code.DayTracker.security.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AccountService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse updateProfile(String currentUsername, ProfileUpdateRequest request) {
        AppUser user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByUsernameAndIdNot(username, user.getId())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmailAndIdNot(email, user.getId())) {
            throw new IllegalArgumentException("Email already exists");
        }

        user.updateProfile(username, email);
        AppUser saved = userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(saved), UserResponse.from(saved));
    }

    @Transactional
    public void deleteAccount(String currentUsername) {
        AppUser user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
        userRepository.flush();
    }
}
