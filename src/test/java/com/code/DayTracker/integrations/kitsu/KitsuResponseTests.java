package com.code.DayTracker.integrations.kitsu;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class KitsuResponseTests {

    @Test
    void readsPosterUrlsWhileIgnoringImageMetadata() throws Exception {
        String json = """
                {"data":[{"id":"1","attributes":{
                  "canonicalTitle":"Example",
                  "titles":{"en":"Example"},
                  "posterImage":{"large":"https://image/large.jpg","original":"https://image/original.jpg","meta":{"dimensions":{}}},
                  "subtype":"movie"
                }}]}
                """;

        KitsuResponse response = new ObjectMapper().readValue(json, KitsuResponse.class);

        assertThat(response.data()).hasSize(1);
        assertThat(response.data().getFirst().attributes().posterImage().large())
                .isEqualTo("https://image/large.jpg");
    }
}
