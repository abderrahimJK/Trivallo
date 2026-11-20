package com.trivallo.catalog.category.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CategoryAdminRequest(
        @NotBlank @Size(max = 80)
        @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*", message = "use lowercase letters, digits and hyphens")
        String slug,
        @Schema(description = "Icon name the frontend knows, e.g. camel, balloon, dune")
        @Size(max = 60) @Pattern(regexp = "[a-z0-9-]*", message = "use lowercase letters, digits and hyphens")
        String icon,
        @NotNull @Min(0) @Max(1_000) Integer sortOrder,
        @NotEmpty @Size(max = 2) List<@Valid @NotNull CategoryTranslationInput> translations) {
}
