package com.code.DayTracker.services;

public interface PasswordResetNotifier {
    void sendResetLink(String email, String rawToken);
}
