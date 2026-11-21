package com.trivallo.catalog.activity.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Descriptions of one image for screen readers and search engines. */
public record ImageTextRequest(
        @Schema(description = "What the image shows, in English", example = "Camels crossing the dunes at sunset")
        @NotBlank @Size(max = 255) String altText,
        @Schema(description = "Same in French; empty falls back to English")
        @Size(max = 255) String altTextFr) {
}
