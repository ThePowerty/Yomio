package com.code.DayTracker.controllers;

import com.code.DayTracker.dto.AuthResponse;
import com.code.DayTracker.dto.ProfileUpdateRequest;
import com.code.DayTracker.services.AccountService;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PutMapping("/profile")
    public AuthResponse updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Principal principal
    ) {
        return accountService.updateProfile(principal.getName(), request);
    }
}
