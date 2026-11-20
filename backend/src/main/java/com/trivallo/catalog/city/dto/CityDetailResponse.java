package com.trivallo.catalog.city.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "City page content, including SEO metadata")
public record CityDetailResponse(
        @Schema(example = "marrakech") String slug,
        @Schema(example = "Marrakech") String name,
        String description,
        String heroImageUrl,
        String metaTitle,
        String metaDescription,
        @Schema(description = "Locale the text is actually in (may differ from the request when falling back to English)", example = "en")
        String locale) {
}
