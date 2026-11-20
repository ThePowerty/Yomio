package com.code.DayTracker.controllers;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AdminDashboardSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void anonymousUsersCannotReadDashboardData() throws Exception {
        mockMvc.perform(get("/api/admin/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void regularUsersCannotReadDashboardData() throws Exception {
        mockMvc.perform(get("/api/admin/overview").with(user("reader").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void administratorsCanReadDashboardData() throws Exception {
        mockMvc.perform(get("/api/admin/overview").with(user("administrator").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.unresolvedMessages").isNumber());
    }

    @Test
    void regularUsersCannotReadAnotherUsersProgressSummary() throws Exception {
        mockMvc.perform(get("/api/admin/users/99/progress").with(user("reader").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void regularUsersCannotChangeRoles() throws Exception {
        mockMvc.perform(patch("/api/admin/users/99/role")
                        .with(user("reader").roles("USER"))
                        .contentType("application/json")
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void administratorsReachTheProtectedProgressEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users/999999/progress")
                        .with(user("administrator").roles("ADMIN")))
                .andExpect(status().isNotFound());
    }
}
