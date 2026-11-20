package com.trivallo.catalog.activity.dto;

import com.trivallo.catalog.activity.ActivityType;
import com.trivallo.catalog.category.dto.CategoryResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;

@Schema(description = "Full activity page content, including SEO metadata")
public record ActivityDetailResponse(
        String slug,
        ActivityType type,
        String title,
        String summary,
        String description,
        String itinerary,
        List<String> included,
        List<String> notIncluded,
        CityRefResponse city,
        CategoryResponse category,
        BigDecimal priceAdultEur,
        BigDecimal priceChildEur,
        int durationMinutes,
        int maxGroupSize,
        @Schema(description = "Days the activity runs, Monday first") List<DayOfWeek> operatingDays,
        String meetingPoint,
        BigDecimal latitude,
        BigDecimal longitude,
        String tripadvisorUrl,
        List<ActivityImageResponse> images,
        String metaTitle,
        String metaDescription,
        @Schema(description = "Locale the text is actually in (may differ from the request when falling back to English)", example = "en")
        String locale) {
}
