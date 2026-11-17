package com.code.DayTracker.services;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

@Component
public class CatalogAliasRegistry {

    private final Map<Integer, LocalizedCatalogTitle> entries;

    public CatalogAliasRegistry(ObjectMapper objectMapper) {
        ClassPathResource resource = new ClassPathResource("catalog-aliases.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<LocalizedCatalogTitle> values = objectMapper.readValue(inputStream, new TypeReference<>() {});
            Map<Integer, LocalizedCatalogTitle> indexed = new LinkedHashMap<>();
            for (LocalizedCatalogTitle value : values) {
                indexed.put(value.anilistId(), value);
            }
            this.entries = Map.copyOf(indexed);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not load catalog aliases", exception);
        }
    }

    public Set<Integer> ids() {
        return entries.keySet();
    }

    public String localizedTitle(Integer anilistId) {
        LocalizedCatalogTitle entry = entries.get(anilistId);
        return entry == null ? null : entry.title();
    }

    public List<String> aliases(Integer anilistId) {
        LocalizedCatalogTitle entry = entries.get(anilistId);
        if (entry == null) {
            return List.of();
        }
        LinkedHashSet<String> values = new LinkedHashSet<>();
        values.add(entry.title());
        if (entry.aliases() != null) {
            values.addAll(entry.aliases());
        }
        return List.copyOf(values);
    }

    public List<Integer> findMatchingIds(String query) {
        String normalizedQuery = normalize(query);
        if (normalizedQuery.isBlank()) {
            return List.of();
        }
        List<Integer> matches = new ArrayList<>();
        for (Map.Entry<Integer, LocalizedCatalogTitle> entry : entries.entrySet()) {
            if (aliases(entry.getKey()).stream().map(CatalogAliasRegistry::normalize)
                    .anyMatch(alias -> alias.contains(normalizedQuery))) {
                matches.add(entry.getKey());
            }
        }
        return matches;
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    public record LocalizedCatalogTitle(
            Integer anilistId,
            String locale,
            String title,
            List<String> aliases
    ) {
    }
}
