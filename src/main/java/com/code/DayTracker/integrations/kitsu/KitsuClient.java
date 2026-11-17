package com.code.DayTracker.integrations.kitsu;

import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class KitsuClient {

    private static final int PAGE_SIZE = 20;
    private final RestClient restClient;
    private final int refreshPages;

    public KitsuClient(
            RestClient.Builder restClientBuilder,
            @Value("${app.catalog.kitsu-refresh-pages:3}") int refreshPages
    ) {
        this.restClient = restClientBuilder.baseUrl("https://kitsu.io/api/edge").build();
        this.refreshPages = refreshPages;
    }

    public List<KitsuResponse.KitsuResource> popularAnime() {
        List<KitsuResponse.KitsuResource> results = new ArrayList<>();
        for (int page = 0; page < refreshPages; page++) {
            int offset = page * PAGE_SIZE;
            KitsuResponse response = restClient.get()
                    .uri(builder -> builder.path("/anime")
                            .queryParam("sort", "-userCount")
                            .queryParam("page[limit]", PAGE_SIZE)
                            .queryParam("page[offset]", offset)
                            .build())
                    .retrieve()
                    .body(KitsuResponse.class);
            if (response == null || response.data() == null || response.data().isEmpty()) {
                break;
            }
            results.addAll(response.data());
        }
        return results;
    }
}
