package com.code.DayTracker.services;

import com.code.DayTracker.dto.CatalogMediaResponse;
import com.code.DayTracker.dto.CatalogPageResponse;
import com.code.DayTracker.integrations.anilist.AniListClient;
import com.code.DayTracker.integrations.anilist.AniListMedia;
import com.code.DayTracker.integrations.mangadex.MangaDexClient;
import com.code.DayTracker.integrations.mangadex.MangaDexTitle;
import com.code.DayTracker.integrations.kitsu.KitsuClient;
import com.code.DayTracker.integrations.kitsu.KitsuResponse;
import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.repositories.CatalogMediaRepository;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

@Service
public class CatalogService {

    private static final Logger LOGGER = LoggerFactory.getLogger(CatalogService.class);

    private final AniListClient aniListClient;
    private final CatalogMediaRepository catalogMediaRepository;
    private final CatalogAliasRegistry aliasRegistry;
    private final MangaDexClient mangaDexClient;
    private final KitsuClient kitsuClient;
    private final int refreshPages;
    private final int animeRefreshPages;
    private final int manhwaRefreshPages;
    private final int refreshPageSize;
    private final boolean refreshOnStartup;
    private final String refreshOnStartupType;
    private final boolean releaseAuditOnStartup;

    public CatalogService(
            AniListClient aniListClient,
            CatalogMediaRepository catalogMediaRepository,
            CatalogAliasRegistry aliasRegistry,
            MangaDexClient mangaDexClient,
            KitsuClient kitsuClient,
            @Value("${app.catalog.refresh-pages:2}") int refreshPages,
            @Value("${app.catalog.anime-refresh-pages:10}") int animeRefreshPages,
            @Value("${app.catalog.manhwa-refresh-pages:10}") int manhwaRefreshPages,
            @Value("${app.catalog.refresh-page-size:25}") int refreshPageSize,
            @Value("${app.catalog.refresh-on-startup:false}") boolean refreshOnStartup,
            @Value("${app.catalog.refresh-on-startup-type:}") String refreshOnStartupType,
            @Value("${app.catalog.release-audit-on-startup:false}") boolean releaseAuditOnStartup
    ) {
        this.aniListClient = aniListClient;
        this.catalogMediaRepository = catalogMediaRepository;
        this.aliasRegistry = aliasRegistry;
        this.mangaDexClient = mangaDexClient;
        this.kitsuClient = kitsuClient;
        this.refreshPages = refreshPages;
        this.animeRefreshPages = animeRefreshPages;
        this.manhwaRefreshPages = manhwaRefreshPages;
        this.refreshPageSize = refreshPageSize;
        this.refreshOnStartup = refreshOnStartup;
        this.refreshOnStartupType = refreshOnStartupType;
        this.releaseAuditOnStartup = releaseAuditOnStartup;
    }

    @Transactional(readOnly = true)
    public List<CatalogMediaResponse> search(String query, MediaType type, int limit) {
        return searchPage(query, type, 0, limit).items();
    }

    @Transactional(readOnly = true)
    public CatalogPageResponse searchPage(String query, MediaType type, int page, int size) {
        String normalizedQuery = normalizeQuery(query);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<CatalogMedia> results = normalizedQuery == null
                ? listCatalog(type, pageRequest)
                : catalogMediaRepository.search(normalizedQuery, type, pageRequest);
        return new CatalogPageResponse(
                results.getContent().stream().map(CatalogMediaResponse::from).toList(),
                results.getNumber(),
                results.getSize(),
                results.getTotalElements(),
                results.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public CatalogMediaResponse findById(Long id) {
        return catalogMediaRepository.findById(id)
                .map(CatalogMediaResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Catalog title not found"));
    }

    @Transactional
    public List<CatalogMediaResponse> searchAndImport(String query, MediaType type, int limit) {
        String normalizedQuery = normalizeQuery(query);
        if (normalizedQuery != null) {
            MediaType remoteType = type == null ? MediaType.MANGA : type;
            if (remoteType == MediaType.MANGA || remoteType == MediaType.MANHWA) {
                for (Integer anilistId : aliasRegistry.findMatchingIds(normalizedQuery)) {
                    AniListMedia localizedMatch = aniListClient.findMangaById(anilistId);
                    if (localizedMatch != null) {
                        saveAll(List.of(localizedMatch), remoteType);
                    }
                }
                importMangaDexMatches(normalizedQuery, limit, remoteType);
            }
            List<AniListMedia> remoteResults = aniListClient.search(remoteType, normalizedQuery, 1, limit);
            saveAll(remoteResults, remoteType);
        }
        return search(normalizedQuery, type, limit);
    }

    private void importMangaDexMatches(String query, int limit, MediaType requestedType) {
        try {
            for (MangaDexTitle match : mangaDexClient.searchKoreanTitles(query, limit)) {
                if (!catalogMediaRepository.existsByAnilistId(match.anilistId())) {
                    AniListMedia aniListMedia = aniListClient.findMangaById(match.anilistId());
                    if (aniListMedia == null) {
                        continue;
                    }
                    saveAll(List.of(aniListMedia), requestedType);
                }
                catalogMediaRepository.findByAnilistId(match.anilistId()).ifPresent(media -> {
                    List<String> currentAliases = media.getAliases() == null
                            ? List.of()
                            : List.of(media.getAliases().split("\\|"));
                    media.updateLocalization(
                            match.spanishTitle(),
                            mergeAliases(currentAliases, match.aliases())
                    );
                    media.updateReleaseProgress(parseChapter(match.lastChapter()), null);
                });
            }
        } catch (RuntimeException exception) {
            LOGGER.warn("MangaDex title enrichment failed for '{}': {}", query, exception.getMessage());
        }
    }

    @Transactional
    public CatalogPageResponse searchAndImportPage(String query, MediaType type, int page, int size) {
        if (page == 0) {
            searchAndImport(query, type, size);
        }
        return searchPage(query, type, page, size);
    }

    @Transactional
    public int refreshCatalog() {
        int imported = 0;
        for (MediaType type : MediaType.values()) {
            imported += refreshCatalog(type);
        }
        for (Integer anilistId : aliasRegistry.ids()) {
            if (!catalogMediaRepository.existsByAnilistId(anilistId)) {
                try {
                    AniListMedia localizedTitle = aniListClient.findMangaById(anilistId);
                    if (localizedTitle != null) {
                        imported += saveAll(List.of(localizedTitle), MediaType.MANGA);
                    }
                } catch (HttpClientErrorException.TooManyRequests exception) {
                    LOGGER.warn("AniList rate limit persisted; catalog refresh kept its partial progress.");
                    break;
                }
            }
        }
        return imported;
    }

    @Transactional
    public int refreshCatalog(MediaType type) {
        int pages = type == MediaType.ANIME
                ? animeRefreshPages
                : type == MediaType.MANHWA ? manhwaRefreshPages : refreshPages;
        int updated = saveAll(aniListClient.popular(type, pages, refreshPageSize), type);
        if (type == MediaType.ANIME || type == MediaType.MOVIE) {
            updated += enrichFromKitsu(type);
        }
        return updated;
    }

    @Transactional
    public int refreshReleaseProgress() {
        int updated = 0;
        for (CatalogMedia media : catalogMediaRepository.findAllByStatusIgnoreCase("RELEASING")) {
            try {
                if (media.getType() == MediaType.ANIME) {
                    List<AniListMedia> matches = aniListClient.search(MediaType.ANIME, media.getTitle(), 1, 10);
                    AniListMedia match = matches.stream().filter(item -> Objects.equals(item.id(), media.getAnilistId())).findFirst().orElse(null);
                    if (match != null && match.nextAiringEpisode() != null) {
                        Instant nextRelease = match.nextAiringEpisode().airingAt() == null ? null : Instant.ofEpochSecond(match.nextAiringEpisode().airingAt());
                        media.updateReleaseProgress(Math.max(0, match.nextAiringEpisode().episode() - 1), nextRelease);
                        catalogMediaRepository.save(media);
                        updated++;
                    }
                } else if (media.getType() == MediaType.MANGA || media.getType() == MediaType.MANHWA) {
                    String language = media.getType() == MediaType.MANHWA ? "ko" : "ja";
                    MangaDexTitle match = mangaDexClient.searchTitles(media.getTitle(), 10, language).stream()
                            .filter(item -> Objects.equals(item.anilistId(), media.getAnilistId())).findFirst().orElse(null);
                    String latestValue = match == null ? null : match.lastChapter();
                    if (match != null && (latestValue == null || latestValue.isBlank())) {
                        latestValue = mangaDexClient.latestPublishedChapter(match.mangaDexId());
                    }
                    Integer latest = parseChapter(latestValue);
                    if (latest != null) { media.updateReleaseProgress(latest, null); catalogMediaRepository.save(media); updated++; }
                }
            } catch (RuntimeException exception) {
                LOGGER.warn("Release progress audit failed for catalog media {}: {}", media.getId(), exception.getMessage());
            }
        }
        return updated;
    }

    private int enrichFromKitsu(MediaType requestedType) {
        int enriched = 0;
        try {
            for (KitsuResponse.KitsuResource resource : kitsuClient.popularAnime()) {
                KitsuResponse.KitsuAttributes attributes = resource.attributes();
                if (attributes == null || attributes.canonicalTitle() == null) continue;
                boolean movie = "movie".equalsIgnoreCase(attributes.subtype());
                if ((requestedType == MediaType.MOVIE) != movie) continue;
                var match = catalogMediaRepository.findFirstByTitleIgnoreCaseOrTitleEnglishIgnoreCase(
                        attributes.canonicalTitle(), attributes.canonicalTitle());
                if (match.isEmpty()) continue;
                CatalogMedia media = match.get();
                List<String> kitsuTitles = attributes.titles() == null
                        ? List.of()
                        : attributes.titles().values().stream().filter(Objects::nonNull).toList();
                media.enrichFromSecondarySource(
                        attributes.titles() == null ? null : attributes.titles().get("en"),
                        mergeAliases(media.getAliases() == null ? List.of() : List.of(media.getAliases().split("\\|")), kitsuTitles),
                        attributes.synopsis(),
                        attributes.posterImage() == null ? null : firstNonBlank(attributes.posterImage().large(), attributes.posterImage().original()),
                        attributes.status(), attributes.episodeCount(), parseRating(attributes.averageRating()), attributes.userCount(),
                        parseYear(attributes.startDate()), parseYear(attributes.endDate()));
                enriched++;
            }
        } catch (RuntimeException exception) {
            LOGGER.warn("Kitsu catalog enrichment failed: {}", exception.getMessage());
        }
        return enriched;
    }

    private Integer parseRating(String rating) {
        try { return rating == null ? null : (int) Math.round(Double.parseDouble(rating)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private Integer parseYear(String date) {
        try { return date == null || date.length() < 4 ? null : Integer.parseInt(date.substring(0, 4)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private Integer parseChapter(String value) {
        try { return value == null || value.isBlank() ? null : (int) Math.floor(Double.parseDouble(value)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    @Scheduled(cron = "${app.catalog.refresh-cron:0 0 4 * * SUN}")
    public void refreshCatalogWeekly() {
        try {
            int imported = refreshCatalog();
            int releaseProgressUpdated = refreshReleaseProgress();
            LOGGER.info("AniList catalog weekly refresh completed. Imported or updated {} items.", imported);
            LOGGER.info("Release progress audit updated {} currently publishing titles.", releaseProgressUpdated);
        } catch (RuntimeException exception) {
            LOGGER.warn("AniList catalog weekly refresh failed: {}", exception.getMessage());
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void refreshCatalogOnStartupWhenEmpty() {
        if (!refreshOnStartup && !releaseAuditOnStartup) {
            return;
        }
        try {
            if (releaseAuditOnStartup) {
                int updated = refreshReleaseProgress();
                LOGGER.info("Release progress startup audit updated {} titles.", updated);
            }
            if (!refreshOnStartup) return;
            MediaType startupType = refreshOnStartupType == null || refreshOnStartupType.isBlank()
                    ? null
                    : MediaType.valueOf(refreshOnStartupType.trim().toUpperCase());
            if (startupType == null && catalogMediaRepository.count() > 0) {
                return;
            }
            int imported = startupType == null ? refreshCatalog() : refreshCatalog(startupType);
            LOGGER.info("AniList catalog startup refresh completed. Imported or updated {} items.", imported);
        } catch (RuntimeException exception) {
            LOGGER.warn("AniList catalog startup refresh failed: {}", exception.getMessage());
        }
    }

    private int saveAll(List<AniListMedia> mediaList, MediaType type) {
        int saved = 0;
        for (AniListMedia aniListMedia : mediaList) {
            if (aniListMedia.id() == null || aniListMedia.title() == null) {
                continue;
            }

            MediaType catalogType = classifyType(type, aniListMedia.countryOfOrigin());
            if (type == MediaType.MANHWA && catalogType != MediaType.MANHWA) {
                continue;
            }

            CatalogMedia catalogMedia = catalogMediaRepository.findByAnilistId(aniListMedia.id())
                    .orElseGet(() -> new CatalogMedia(aniListMedia.id(), catalogType));
            catalogMedia.changeType(catalogType);
            catalogMedia.updateDetails(
                    firstPresent(aniListMedia.title().romaji(), aniListMedia.title().english(), aniListMedia.title().nativeTitle()),
                    aniListMedia.title().english(),
                    aniListMedia.title().nativeTitle(),
                    aliasRegistry.localizedTitle(aniListMedia.id()),
                    mergeAliases(aliasRegistry.aliases(aniListMedia.id()), aniListMedia.synonyms()),
                    sanitizeDescription(aniListMedia.description()),
                    aniListMedia.coverImage() == null ? null : aniListMedia.coverImage().large(),
                    aniListMedia.bannerImage(),
                    aniListMedia.status(),
                    aniListMedia.episodes(),
                    aniListMedia.chapters(),
                    aniListMedia.volumes(),
                    aniListMedia.averageScore(),
                    aniListMedia.popularity(),
                    aniListMedia.genres() == null ? null : String.join("|", aniListMedia.genres()),
                    aniListMedia.startDate() == null ? null : aniListMedia.startDate().year(),
                    aniListMedia.endDate() == null ? null : aniListMedia.endDate().year(),
                    aniListMedia.seasonYear(),
                    aniListMedia.countryOfOrigin(),
                    aniListMedia.source(),
                    aniListMedia.updatedAt()
            );
            Integer completedTotal = catalogType == MediaType.ANIME || catalogType == MediaType.MOVIE
                    ? aniListMedia.episodes() : aniListMedia.chapters();
            Integer latestReleased = aniListMedia.nextAiringEpisode() == null
                    ? completedTotal
                    : Math.max(0, aniListMedia.nextAiringEpisode().episode() - 1);
            Instant nextRelease = aniListMedia.nextAiringEpisode() == null || aniListMedia.nextAiringEpisode().airingAt() == null
                    ? null : Instant.ofEpochSecond(aniListMedia.nextAiringEpisode().airingAt());
            catalogMedia.updateReleaseProgress(latestReleased, nextRelease);
            catalogMediaRepository.save(catalogMedia);
            saved++;
        }
        return saved;
    }

    @SafeVarargs
    private final String mergeAliases(List<String>... sources) {
        LinkedHashSet<String> values = new LinkedHashSet<>();
        for (List<String> source : sources) {
            if (source != null) {
                source.stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .forEach(values::add);
            }
        }
        return values.isEmpty() ? null : String.join("|", values);
    }

    private MediaType classifyType(MediaType requestedType, String countryOfOrigin) {
        if (requestedType == MediaType.MOVIE) {
            return MediaType.MOVIE;
        }
        if (requestedType != MediaType.ANIME && "KR".equalsIgnoreCase(countryOfOrigin)) {
            return MediaType.MANHWA;
        }
        return requestedType == MediaType.MANHWA ? MediaType.MANGA : requestedType;
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim();
    }

    private Page<CatalogMedia> listCatalog(MediaType type, PageRequest pageRequest) {
        if (type == null) {
            return catalogMediaRepository.findAllByOrderByPopularityDescAverageScoreDesc(pageRequest);
        }
        return catalogMediaRepository.findByTypeOrderByPopularityDescAverageScoreDesc(type, pageRequest);
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            if (Objects.nonNull(value) && !value.isBlank()) {
                return value;
            }
        }
        return "Untitled";
    }

    private String sanitizeDescription(String description) {
        if (description == null) {
            return null;
        }
        return description
                .replace("<br>", "\n")
                .replace("<br/>", "\n")
                .replace("<br />", "\n")
                .replaceAll("<[^>]+>", "")
                .trim();
    }
}
