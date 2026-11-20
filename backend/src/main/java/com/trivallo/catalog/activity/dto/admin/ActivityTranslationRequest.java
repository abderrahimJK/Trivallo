package com.trivallo.catalog.activity.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Text of an activity in one language. */
public record ActivityTranslationRequest(
        @Schema(example = "fr") @NotBlank @Pattern(regexp = "en|fr", message = "must be en or fr") String locale,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 500) String summary,
        @Size(max = 10_000) String description,
        @Size(max = 10_000) String itinerary,
        @Schema(description = "One item per entry") @Size(max = 30) List<@NotBlank @Size(max = 200) String> included,
        @Size(max = 30) List<@NotBlank @Size(max = 200) String> notIncluded,
        @Size(max = 120) String metaTitle,
        @Size(max = 320) String metaDescription) {
}
