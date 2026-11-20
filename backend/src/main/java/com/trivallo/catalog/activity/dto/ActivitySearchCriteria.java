package com.trivallo.catalog.activity.dto;

import com.trivallo.catalog.activity.ActivityType;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

/** Optional filters for the public activity list. Every field may be omitted. */
public record ActivitySearchCriteria(
        @Parameter(description = "City slug", example = "marrakech") String city,
        @Parameter(description = "Category slug", example = "desert-tour") String category,
        @Parameter(description = "Excursion or activity") ActivityType type,
        @Parameter(description = "Minimum adult price in EUR") @PositiveOrZero BigDecimal minPrice,
        @Parameter(description = "Maximum adult price in EUR") @PositiveOrZero BigDecimal maxPrice,
        @Parameter(description = "Minimum duration in minutes") @Positive Integer minDuration,
        @Parameter(description = "Maximum duration in minutes") @Positive Integer maxDuration) {

    @Schema(hidden = true)
    @AssertTrue(message = "minPrice must not be greater than maxPrice")
    public boolean isPriceRangeValid() {
        return minPrice == null || maxPrice == null || minPrice.compareTo(maxPrice) <= 0;
    }

    @Schema(hidden = true)
    @AssertTrue(message = "minDuration must not be greater than maxDuration")
    public boolean isDurationRangeValid() {
        return minDuration == null || maxDuration == null || minDuration <= maxDuration;
    }
}
