package com.trivallo.catalog.activity.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ImageOrderRequest(
        @Schema(description = "Every image id of the activity, first one is the cover")
        @NotEmpty List<@NotNull Long> imageIds) {
}
