package com.code.DayTracker.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RateLimitFilterTests {

    @Test
    void authenticationEndpointsReturn429AfterConfiguredLimit() throws Exception {
        RateLimitFilter filter = new RateLimitFilter(true, 120, 2);

        for (int requestNumber = 1; requestNumber <= 3; requestNumber++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr("192.0.2.10");
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, new MockFilterChain());

            assertEquals(requestNumber <= 2 ? 200 : 429, response.getStatus());
            if (requestNumber == 3) {
                assertEquals("RATE_LIMITED", response.getContentAsString().contains("RATE_LIMITED")
                        ? "RATE_LIMITED" : "missing");
            }
        }
    }
}
