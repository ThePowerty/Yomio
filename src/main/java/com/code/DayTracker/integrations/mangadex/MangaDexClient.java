package com.code.DayTracker.integrations.mangadex;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class MangaDexClient {

    private final RestClient restClient;

    public MangaDexClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://api.mangadex.org").build();
    }

    public List<MangaDexTitle> searchKoreanTitles(String query, int limit) {
        return searchTitles(query, limit, "ko");
    }

    public List<MangaDexTitle> searchTitles(String query, int limit, String originalLanguage) {
        MangaDexResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/manga")
                        .queryParam("title", query)
                        .queryParam("limit", Math.min(limit, 20))
                        .queryParam("originalLanguage[]", originalLanguage)
                        .build())
                .retrieve()
                .body(MangaDexResponse.class);
        if (response == null || response.data() == null) {
            return List.of();
        }
        return response.data().stream()
                .map(this::toTitle)
                .filter(title -> title.anilistId() != null)
                .toList();
    }

    public String latestPublishedChapter(String mangaDexId) {
        MangaDexFeedResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder.path("/manga/{id}/feed")
                        .queryParam("limit", 20)
                        .queryParam("order[chapter]", "desc")
                        .queryParam("includeFutureUpdates", "0")
                        .queryParam("contentRating[]", "safe")
                        .queryParam("contentRating[]", "suggestive")
                        .build(mangaDexId))
                .retrieve().body(MangaDexFeedResponse.class);
        if (response == null || response.data() == null) return null;
        return response.data().stream().map(MangaDexFeedResponse.ChapterData::attributes)
                .filter(java.util.Objects::nonNull).map(MangaDexFeedResponse.ChapterAttributes::chapter)
                .filter(value -> value != null && !value.isBlank())
                .max(java.util.Comparator.comparingDouble(this::numericChapter)).orElse(null);
    }

    private double numericChapter(String value) {
        try { return Double.parseDouble(value); } catch (NumberFormatException ignored) { return -1; }
    }

    private MangaDexTitle toTitle(MangaDexResponse.MangaDexData data) {
        MangaDexResponse.MangaDexAttributes attributes = data.attributes();
        LinkedHashSet<String> aliases = new LinkedHashSet<>();
        addValues(aliases, attributes.title());
        if (attributes.altTitles() != null) {
            attributes.altTitles().forEach(values -> addValues(aliases, values));
        }
        String spanishTitle = valueForLanguage(attributes.title(), "es");
        if (spanishTitle == null && attributes.altTitles() != null) {
            spanishTitle = attributes.altTitles().stream()
                    .map(values -> valueForLanguage(values, "es"))
                    .filter(value -> value != null && !value.isBlank())
                    .findFirst()
                    .orElse(null);
        }
        return new MangaDexTitle(
                data.id(),
                parseAniListId(attributes.links()),
                spanishTitle,
                List.copyOf(aliases),
                attributes.lastChapter()
        );
    }

    private void addValues(LinkedHashSet<String> target, Map<String, String> values) {
        if (values != null) {
            values.values().stream().filter(value -> value != null && !value.isBlank()).forEach(target::add);
        }
    }

    private String valueForLanguage(Map<String, String> values, String language) {
        return values == null ? null : values.get(language);
    }

    private Integer parseAniListId(Map<String, String> links) {
        if (links == null || links.get("al") == null) {
            return null;
        }
        try {
            return Integer.valueOf(links.get("al"));
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
