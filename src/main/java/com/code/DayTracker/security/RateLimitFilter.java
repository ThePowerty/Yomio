package com.code.DayTracker.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_SECONDS = 60;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final boolean enabled;
    private final int generalLimit;
    private final int authLimit;

    public RateLimitFilter(
            @Value("${app.rate-limit.enabled:true}") boolean enabled,
            @Value("${app.rate-limit.general-per-minute:120}") int generalLimit,
            @Value("${app.rate-limit.auth-per-minute:10}") int authLimit
    ) {
        this.enabled = enabled;
        this.generalLimit = generalLimit;
        this.authLimit = authLimit;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!enabled || HttpMethod.OPTIONS.matches(request.getMethod()) || !request.getRequestURI().startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        long now = Instant.now().getEpochSecond();
        boolean authEndpoint = request.getRequestURI().startsWith("/api/auth/");
        int limit = authEndpoint ? authLimit : generalLimit;
        String key = (authEndpoint ? "auth:" : "api:") + clientKey(request);
        Window window = windows.compute(key, (ignored, current) -> {
            if (current == null || now - current.startedAt >= WINDOW_SECONDS) {
                return new Window(now);
            }
            current.count.incrementAndGet();
            return current;
        });

        if (window.count.get() > limit) {
            long retryAfter = Math.max(1, WINDOW_SECONDS - (now - window.startedAt));
            response.setStatus(429);
            response.setHeader("Retry-After", Long.toString(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"status\":429,\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests\"}");
            return;
        }

        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(entry -> now - entry.getValue().startedAt >= WINDOW_SECONDS);
        }
        chain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            return "user:" + authentication.getName();
        }
        return "ip:" + request.getRemoteAddr();
    }

    private static final class Window {
        private final long startedAt;
        private final AtomicInteger count = new AtomicInteger(1);

        private Window(long startedAt) {
            this.startedAt = startedAt;
        }
    }
}
