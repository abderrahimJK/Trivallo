package com.trivallo.catalog.activity.dto;

import com.trivallo.catalog.activity.ActivityType;
import com.trivallo.catalog.category.dto.CategoryResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Activity card for lists")
public record ActivitySummaryResponse(
        @Schema(example = "hot-air-balloon-sunrise-marrakech") String slug,
        ActivityType type,
        String title,
        String summary,
        CityRefResponse city,
        CategoryResponse category,
        @Schema(example = "180.00") BigDecimal priceAdultEur,
        @Schema(example = "120.00") BigDecimal priceChildEur,
        @Schema(example = "240") int durationMinutes,
        @Schema(description = "First image by sort order, null when the activity has none")
        String coverImageUrl) {
}
