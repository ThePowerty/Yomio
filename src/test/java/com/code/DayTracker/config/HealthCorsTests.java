package com.code.DayTracker.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class HealthCorsTests {

    @Test
    void healthAllowsReadAccessFromConfiguredOriginsOnly() {
        var source = new SecurityConfig().corsConfigurationSource("https://pages.example");
        var health = source.getCorsConfiguration(new MockHttpServletRequest("GET", "/actuator/health"));

        assertThat(health).isNotNull();
        assertThat(health.checkOrigin("https://pages.example")).isEqualTo("https://pages.example");
        assertThat(health.checkOrigin("https://other.example")).isNull();
        assertThat(health.checkHttpMethod(HttpMethod.GET)).containsExactly(HttpMethod.GET);
        assertThat(health.checkHttpMethod(HttpMethod.POST)).isNull();
        assertThat(source.getCorsConfiguration(new MockHttpServletRequest("GET", "/actuator/prometheus"))).isNull();
    }
}
