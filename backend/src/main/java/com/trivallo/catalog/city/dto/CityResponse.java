package com.trivallo.catalog.city.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "City card for lists")
public record CityResponse(
        @Schema(example = "marrakech") String slug,
        @Schema(example = "Marrakech") String name,
        String description,
        String heroImageUrl) {
}
