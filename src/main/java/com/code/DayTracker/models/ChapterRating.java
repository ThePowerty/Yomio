package com.code.DayTracker.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chapter_ratings", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "catalog_media_id", "unit_number"}))
public class ChapterRating {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private AppUser user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "catalog_media_id") private CatalogMedia media;
    @Column(nullable = false) private Integer unitNumber;
    @Column(nullable = false) private Integer rating;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant updatedAt = Instant.now();
    protected ChapterRating() {}
    public ChapterRating(AppUser user, CatalogMedia media, int unitNumber, int rating) { this.user=user; this.media=media; this.unitNumber=unitNumber; this.rating=rating; }
    public void changeRating(int rating) { this.rating=rating; this.updatedAt=Instant.now(); }
    public Long getId(){return id;} public AppUser getUser(){return user;} public CatalogMedia getMedia(){return media;}
    public Integer getUnitNumber(){return unitNumber;} public Integer getRating(){return rating;} public Instant getUpdatedAt(){return updatedAt;}
}
