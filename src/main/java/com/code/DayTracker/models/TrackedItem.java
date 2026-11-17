package com.code.DayTracker.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tracked_items")
public class TrackedItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType type;

    @Column(nullable = false)
    private Integer currentChapter = 0;

    private Integer totalChapters;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ReadingStatus readingStatus = ReadingStatus.PLAN_TO_READ;

    private Integer score;

    @Column(nullable = false)
    private boolean finished = false;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    protected TrackedItem() {
    }

    public TrackedItem(String title, MediaType type, Integer currentChapter, Integer totalChapters, ReadingStatus readingStatus, Integer score, boolean finished, String notes, AppUser user) {
        this.title = title;
        this.type = type;
        this.currentChapter = currentChapter;
        this.totalChapters = totalChapters;
        this.readingStatus = readingStatus;
        this.score = score;
        this.finished = finished;
        this.notes = notes;
        this.user = user;
    }

    public void update(String title, MediaType type, Integer currentChapter, Integer totalChapters, ReadingStatus readingStatus, Integer score, boolean finished, String notes) {
        this.title = title;
        this.type = type;
        this.currentChapter = currentChapter;
        this.totalChapters = totalChapters;
        this.readingStatus = readingStatus;
        this.score = score;
        this.finished = finished;
        this.notes = notes;
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public MediaType getType() {
        return type;
    }

    public Integer getCurrentChapter() {
        return currentChapter;
    }

    public Integer getTotalChapters() {
        return totalChapters;
    }

    public ReadingStatus getReadingStatus() {
        if (readingStatus != null) {
            return readingStatus;
        }
        return finished ? ReadingStatus.COMPLETED : ReadingStatus.READING;
    }

    public Integer getScore() {
        return score;
    }

    public boolean isFinished() {
        return finished;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public AppUser getUser() {
        return user;
    }
}
