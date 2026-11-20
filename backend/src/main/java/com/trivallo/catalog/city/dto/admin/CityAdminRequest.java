package com.trivallo.catalog.city.dto.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CityAdminRequest(
        @NotBlank @Size(max = 80)
        @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*", message = "use lowercase letters, digits and hyphens")
        String slug,
        @NotNull @Min(0) @Max(1_000) Integer sortOrder,
        @NotEmpty @Size(max = 2) List<@Valid @NotNull CityTranslationInput> translations) {
}
