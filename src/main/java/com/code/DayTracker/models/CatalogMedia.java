package com.code.DayTracker.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "catalog_media")
public class CatalogMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer anilistId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType type;

    @Column(nullable = false, length = 220)
    private String title;

    @Column(length = 220)
    private String titleEnglish;

    @Column(length = 220)
    private String titleNative;

    @Column(length = 220)
    private String titleLocalized;

    @Column(length = 2000)
    private String aliases;

    @Column(length = 4000)
    private String description;

    @Column(length = 500)
    private String coverImage;

    @Column(length = 500)
    private String bannerImage;

    @Column(length = 40)
    private String status;

    private Integer episodes;

    private Integer chapters;

    private Integer volumes;

    private Integer averageScore;

    private Integer popularity;

    @Column(length = 500)
    private String genres;

    private Integer startYear;

    private Integer endYear;

    private Integer seasonYear;

    @Column(length = 10)
    private String countryOfOrigin;

    @Column(length = 50)
    private String source;

    private Long providerUpdatedAt;

    private Integer latestReleasedUnit;

    private Instant nextReleaseAt;

    @Column(nullable = false)
    private Instant lastSyncedAt = Instant.now();

    protected CatalogMedia() {
    }

    public CatalogMedia(Integer anilistId, MediaType type) {
        this.anilistId = anilistId;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public Integer getAnilistId() {
        return anilistId;
    }

    public MediaType getType() {
        return type;
    }

    public void changeType(MediaType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public String getTitleEnglish() {
        return titleEnglish;
    }

    public String getTitleNative() {
        return titleNative;
    }

    public String getTitleLocalized() {
        return titleLocalized;
    }

    public String getAliases() {
        return aliases;
    }

    public void updateLocalization(String titleLocalized, String aliases) {
        if (titleLocalized != null && !titleLocalized.isBlank()) {
            this.titleLocalized = truncate(titleLocalized, 220);
        }
        this.aliases = truncate(aliases, 2000);
    }

    public void enrichFromSecondarySource(
            String titleEnglish,
            String aliases,
            String description,
            String coverImage,
            String status,
            Integer episodes,
            Integer averageScore,
            Integer popularity,
            Integer startYear,
            Integer endYear
    ) {
        if ((this.titleEnglish == null || this.titleEnglish.isBlank()) && titleEnglish != null) this.titleEnglish = truncate(titleEnglish, 220);
        if (aliases != null && !aliases.isBlank()) this.aliases = truncate(aliases, 2000);
        if ((this.description == null || this.description.isBlank()) && description != null) this.description = truncate(description, 4000);
        if ((this.coverImage == null || this.coverImage.isBlank()) && coverImage != null) this.coverImage = truncate(coverImage, 500);
        if ((this.status == null || this.status.isBlank()) && status != null) this.status = truncate(status, 40);
        if (this.episodes == null && episodes != null) this.episodes = episodes;
        if (this.averageScore == null && averageScore != null) this.averageScore = averageScore;
        if (this.popularity == null && popularity != null) this.popularity = popularity;
        if (this.startYear == null && startYear != null) this.startYear = startYear;
        if (this.endYear == null && endYear != null) this.endYear = endYear;
        this.lastSyncedAt = Instant.now();
    }

    public String getDescription() {
        return description;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public String getStatus() {
        return status;
    }

    public Integer getEpisodes() {
        return episodes;
    }

    public Integer getChapters() {
        return chapters;
    }

    public Integer getVolumes() {
        return volumes;
    }

    public Integer getAverageScore() {
        return averageScore;
    }

    public Integer getPopularity() {
        return popularity;
    }

    public String getGenres() {
        return genres;
    }

    public Integer getStartYear() {
        return startYear;
    }

    public Integer getEndYear() {
        return endYear;
    }

    public Integer getSeasonYear() {
        return seasonYear;
    }

    public String getCountryOfOrigin() {
        return countryOfOrigin;
    }

    public String getSource() {
        return source;
    }

    public Long getProviderUpdatedAt() {
        return providerUpdatedAt;
    }

    public Instant getLastSyncedAt() {
        return lastSyncedAt;
    }

    public Integer getLatestReleasedUnit() { return latestReleasedUnit; }
    public Instant getNextReleaseAt() { return nextReleaseAt; }

    public void updateReleaseProgress(Integer latestReleasedUnit, Instant nextReleaseAt) {
        if (latestReleasedUnit != null && latestReleasedUnit >= 0) this.latestReleasedUnit = latestReleasedUnit;
        this.nextReleaseAt = nextReleaseAt;
    }

    public void updateDetails(
            String title,
            String titleEnglish,
            String titleNative,
            String titleLocalized,
            String aliases,
            String description,
            String coverImage,
            String bannerImage,
            String status,
            Integer episodes,
            Integer chapters,
            Integer volumes,
            Integer averageScore,
            Integer popularity,
            String genres,
            Integer startYear,
            Integer endYear,
            Integer seasonYear,
            String countryOfOrigin,
            String source,
            Long providerUpdatedAt
    ) {
        this.title = truncate(title, 220);
        this.titleEnglish = truncate(titleEnglish, 220);
        this.titleNative = truncate(titleNative, 220);
        this.titleLocalized = truncate(titleLocalized, 220);
        this.aliases = truncate(aliases, 2000);
        this.description = truncate(description, 4000);
        this.coverImage = truncate(coverImage, 500);
        this.bannerImage = truncate(bannerImage, 500);
        this.status = truncate(status, 40);
        this.episodes = episodes;
        this.chapters = chapters;
        this.volumes = volumes;
        this.averageScore = averageScore;
        this.popularity = popularity;
        this.genres = truncate(genres, 500);
        this.startYear = startYear;
        this.endYear = endYear;
        this.seasonYear = seasonYear;
        this.countryOfOrigin = truncate(countryOfOrigin, 10);
        this.source = truncate(source, 50);
        this.providerUpdatedAt = providerUpdatedAt;
        this.lastSyncedAt = Instant.now();
    }

    private String truncate(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
