package com.trivallo.catalog.activity.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "The city an activity belongs to")
public record CityRefResponse(
        @Schema(example = "marrakech") String slug,
        @Schema(example = "Marrakech") String name) {
}
