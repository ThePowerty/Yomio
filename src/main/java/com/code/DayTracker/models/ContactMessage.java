package com.code.DayTracker.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "contact_messages")
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private AppUser user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private ContactCategory category;
    @Column(nullable = false, length = 120) private String subject;
    @Column(nullable = false, length = 2000) private String message;
    @Column(nullable = false) private Instant createdAt = Instant.now();
    private Instant resolvedAt;

    protected ContactMessage() {}
    public ContactMessage(AppUser user, ContactCategory category, String subject, String message) {
        this.user = user; this.category = category; this.subject = subject; this.message = message;
    }
    public void resolve() { if (resolvedAt == null) resolvedAt = Instant.now(); }
    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public ContactCategory getCategory() { return category; }
    public String getSubject() { return subject; }
    public String getMessage() { return message; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getResolvedAt() { return resolvedAt; }
}
