package com.trivallo.catalog.category.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Category name in one language; used in both requests and responses. */
public record CategoryTranslationInput(
        @NotBlank @Pattern(regexp = "en|fr", message = "must be en or fr") String locale,
        @NotBlank @Size(max = 120) String name) {
}
