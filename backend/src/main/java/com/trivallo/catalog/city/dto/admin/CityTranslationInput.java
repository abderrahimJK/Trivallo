package com.trivallo.catalog.city.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** City text in one language; used in both requests and responses. */
public record CityTranslationInput(
        @NotBlank @Pattern(regexp = "en|fr", message = "must be en or fr") String locale,
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2_000) String description,
        @Size(max = 120) String metaTitle,
        @Size(max = 320) String metaDescription) {
}
