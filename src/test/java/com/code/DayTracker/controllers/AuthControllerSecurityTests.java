package com.code.DayTracker.controllers;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.code.DayTracker.config.SecurityConfig;
import com.code.DayTracker.dto.LoginRequest;
import com.code.DayTracker.security.JwtService;
import com.code.DayTracker.services.AuthService;
import com.code.DayTracker.services.PasswordResetService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
class AuthControllerSecurityTests {

    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private AuthService auth;
    @MockitoBean
    private PasswordResetService recovery;
    @MockitoBean
    private JwtService jwt;
    @MockitoBean
    private UserDetailsService users;

    @Test
    void loginAcceptsEmailAndPassword() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"email\":\"reader@example.com\",\"password\":\"example-password\"}"))
                .andExpect(status().isOk());
        verify(auth).login(new LoginRequest("reader@example.com", "example-password"));
    }

    @Test
    void loginRejectsUsernameOnly() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("{\"username\":\"reader\",\"password\":\"example-password\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(auth);
    }

    @Test
    void accountResetRequiresAuthentication() throws Exception {
        mvc.perform(post("/api/auth/password-reset/account"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(recovery);
    }

    @Test
    void accountResetUsesThePrincipalInsteadOfTheBody() throws Exception {
        mvc.perform(post("/api/auth/password-reset/account")
                        .with(user("reader"))
                        .contentType("application/json")
                        .content("{\"email\":\"other@example.com\"}"))
                .andExpect(status().isAccepted());
        verify(recovery).requestAccountReset("reader");
    }

    @Test
    void anonymousRecoveryAcceptsAValidEmail() throws Exception {
        mvc.perform(post("/api/auth/password-reset/request")
                        .contentType("application/json")
                        .content("{\"email\":\"reader@example.com\"}"))
                .andExpect(status().isAccepted());
        verify(recovery).requestReset("reader@example.com");
    }
}
