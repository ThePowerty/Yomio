package com.code.DayTracker.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "progress_notes")
public class ProgressNote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private AppUser user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "catalog_media_id") private CatalogMedia media;
    @Column(nullable = false) private Integer unitNumber;
    private Integer volumeNumber;
    @Column(nullable = false, length = 2000) private String content;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant updatedAt = Instant.now();
    protected ProgressNote() {}
    public ProgressNote(AppUser user, CatalogMedia media, int unitNumber, Integer volumeNumber, String content) {
        this.user = user; this.media = media; this.unitNumber = unitNumber; this.volumeNumber = volumeNumber; this.content = content;
    }
    public void update(int unitNumber, Integer volumeNumber, String content) { this.unitNumber = unitNumber; this.volumeNumber = volumeNumber; this.content = content; this.updatedAt = Instant.now(); }
    public Long getId() { return id; } public AppUser getUser() { return user; } public CatalogMedia getMedia() { return media; }
    public Integer getUnitNumber() { return unitNumber; } public Integer getVolumeNumber() { return volumeNumber; }
    public String getContent() { return content; } public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; }
}
