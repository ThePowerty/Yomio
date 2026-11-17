package com.code.DayTracker.integrations.anilist;

import com.code.DayTracker.models.MediaType;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

@Component
public class AniListClient {

    private static final String SEARCH_QUERY = """
            query ($page: Int, $perPage: Int, $type: MediaType, $search: String, $country: CountryCode, $format: MediaFormat, $formatNot: MediaFormat) {
              Page(page: $page, perPage: $perPage) {
                media(type: $type, search: $search, countryOfOrigin: $country, format: $format, format_not: $formatNot, sort: [POPULARITY_DESC, SCORE_DESC]) {
                  id
                  title {
                    romaji
                    english
                    nativeTitle: native
                  }
                  description(asHtml: false)
                  coverImage {
                    large
                  }
                  bannerImage
                  status
                  episodes
                  chapters
                  volumes
                  averageScore
                  popularity
                  genres
                  synonyms
                  startDate {
                    year
                  }
                  endDate {
                    year
                  }
                  seasonYear
                  countryOfOrigin
                  source
                  updatedAt
                }
              }
            }
            """;

    private static final String MEDIA_BY_ID_QUERY = """
            query ($id: Int!) {
              Media(id: $id, type: MANGA) {
                id
                title { romaji english nativeTitle: native }
                description(asHtml: false)
                coverImage { large }
                bannerImage
                status
                episodes
                chapters
                volumes
                averageScore
                popularity
                genres
                synonyms
                startDate { year }
                endDate { year }
                seasonYear
                countryOfOrigin
                source
                updatedAt
              }
            }
            """;

    private final RestClient restClient;
    private final long minimumIntervalMs;
    private final int maxRateLimitRetries;
    private final Object rateLimitLock = new Object();
    private long nextRequestAt;

    public AniListClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.catalog.anilist-min-interval-ms:2100}") long minimumIntervalMs,
            @Value("${app.catalog.anilist-rate-limit-retries:2}") int maxRateLimitRetries
    ) {
        this.restClient = restClientBuilder
                .baseUrl("https://graphql.anilist.co")
                .build();
        this.minimumIntervalMs = minimumIntervalMs;
        this.maxRateLimitRetries = maxRateLimitRetries;
    }

    public List<AniListMedia> search(MediaType type, String query, int page, int perPage) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("page", page);
        variables.put("perPage", perPage);
        variables.put("type", type == MediaType.MANHWA ? MediaType.MANGA.name() : type == MediaType.MOVIE ? MediaType.ANIME.name() : type.name());
        String graphQlQuery = SEARCH_QUERY;
        if (query == null || query.isBlank()) {
            graphQlQuery = graphQlQuery
                    .replace(", $search: String", "")
                    .replace(", search: $search", "");
        } else {
            variables.put("search", query);
        }
        if (type == MediaType.MANHWA) {
            variables.put("country", "KR");
        } else {
            graphQlQuery = graphQlQuery
                    .replace(", $country: CountryCode", "")
                    .replace(", countryOfOrigin: $country", "");
        }
        if (type == MediaType.MOVIE) {
            variables.put("format", "MOVIE");
            graphQlQuery = graphQlQuery
                    .replace(", $formatNot: MediaFormat", "")
                    .replace(", format_not: $formatNot", "");
        } else if (type == MediaType.ANIME) {
            variables.put("formatNot", "MOVIE");
            graphQlQuery = graphQlQuery
                    .replace(", $format: MediaFormat", "")
                    .replace(", format: $format", "");
        } else {
            graphQlQuery = graphQlQuery
                    .replace(", $format: MediaFormat", "")
                    .replace(", $formatNot: MediaFormat", "")
                    .replace(", format: $format", "")
                    .replace(", format_not: $formatNot", "");
        }

        Map<String, Object> request = Map.of(
                "query", graphQlQuery,
                "variables", variables
        );

        AniListGraphQlResponse response = executeWithRateLimit(() -> restClient.post()
                .body(request)
                .retrieve()
                .body(AniListGraphQlResponse.class));

        if (response == null || response.data() == null || response.data().Page() == null) {
            return List.of();
        }

        return response.data().Page().media();
    }

    public List<AniListMedia> popular(MediaType type, int pages, int perPage) {
        List<AniListMedia> results = new ArrayList<>();
        for (int page = 1; page <= pages; page++) {
            try {
                results.addAll(search(type, null, page, perPage));
            } catch (HttpClientErrorException.TooManyRequests exception) {
                break;
            }
        }
        return results;
    }

    public AniListMedia findMangaById(Integer id) {
        Map<String, Object> request = Map.of(
                "query", MEDIA_BY_ID_QUERY,
                "variables", Map.of("id", id)
        );
        AniListGraphQlResponse response = executeWithRateLimit(() -> restClient.post()
                .body(request)
                .retrieve()
                .body(AniListGraphQlResponse.class));
        return response == null || response.data() == null ? null : response.data().Media();
    }

    private <T> T executeWithRateLimit(Supplier<T> request) {
        int retries = 0;
        while (true) {
            waitForRequestSlot();
            try {
                return request.get();
            } catch (HttpClientErrorException.TooManyRequests exception) {
                if (retries >= maxRateLimitRetries) {
                    throw exception;
                }
                retries++;
                sleep(retryAfterMs(exception));
            }
        }
    }

    private void waitForRequestSlot() {
        synchronized (rateLimitLock) {
            long now = System.currentTimeMillis();
            if (nextRequestAt > now) {
                sleep(nextRequestAt - now);
            }
            nextRequestAt = System.currentTimeMillis() + minimumIntervalMs;
        }
    }

    private long retryAfterMs(HttpClientErrorException.TooManyRequests exception) {
        String retryAfter = exception.getResponseHeaders().getFirst("Retry-After");
        if (retryAfter != null) {
            try {
                return Math.max(0, Long.parseLong(retryAfter)) * 1000L;
            } catch (NumberFormatException ignored) {
                // Fall back to AniList's documented one-minute timeout.
            }
        }
        return 60_000L;
    }

    private void sleep(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("AniList request interrupted", exception);
        }
    }
}
