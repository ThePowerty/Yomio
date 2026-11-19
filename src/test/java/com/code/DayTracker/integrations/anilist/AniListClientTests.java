package com.code.DayTracker.integrations.anilist;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import com.code.DayTracker.models.MediaType;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

class AniListClientTests {

    @Test
    void popularAnimeOmitsNullableSearchAndCountryFilters() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andExpect(jsonPath("$.variables.search").doesNotExist())
                .andExpect(jsonPath("$.variables.country").doesNotExist())
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body("{\"data\":{\"Page\":{\"media\":[{\"id\":1,\"title\":{\"romaji\":\"First\"}}]}}}"));

        AniListClient client = new AniListClient(builder, 0, 0);

        assertThat(client.popular(MediaType.ANIME, 1, 1)).hasSize(1);
        server.verify();
    }

    @Test
    void releasingAnimeRequestsOnlyCurrentlyAiringTitles() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andExpect(jsonPath("$.variables.status").value("RELEASING"))
                .andExpect(jsonPath("$.variables.search").doesNotExist())
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body("{\"data\":{\"Page\":{\"media\":[{\"id\":195604,\"title\":{\"romaji\":\"Black Clover 2nd Season\"},\"status\":\"RELEASING\"}]}}}"));

        AniListClient client = new AniListClient(builder, 0, 0);

        assertThat(client.releasing(MediaType.ANIME, 10, 50))
                .extracting(AniListMedia::id)
                .containsExactly(195604);
        server.verify();
    }

    @Test
    void retriesAfterRateLimitResponse() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "0"));
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body("{\"data\":{\"Page\":{\"media\":[]}}}"));

        AniListClient client = new AniListClient(builder, 0, 1);

        assertThat(client.search(MediaType.MANHWA, "test", 1, 1)).isEmpty();
        server.verify();
    }

    @Test
    void keepsRefreshPartialWhenRateLimitPersists() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer server = MockRestServiceServer.bindTo(builder).build();
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andRespond(withStatus(HttpStatus.OK)
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .body("{\"data\":{\"Page\":{\"media\":[{\"id\":1,\"title\":{\"romaji\":\"First\"}}]}}}"));
        server.expect(once(), requestTo("https://graphql.anilist.co"))
                .andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS).header("Retry-After", "0"));

        AniListClient client = new AniListClient(builder, 0, 0);

        assertThat(client.popular(MediaType.MANHWA, 3, 1))
                .extracting(AniListMedia::id)
                .containsExactly(1);
        server.verify();
    }
}
