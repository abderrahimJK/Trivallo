package com.trivallo.catalog.category.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Activity category, used for filters and badges")
public record CategoryResponse(
        @Schema(example = "hot-air-balloon") String slug,
        @Schema(example = "Hot-air balloon") String name,
        @Schema(example = "balloon") String icon) {
}
