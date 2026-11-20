package com.trivallo.catalog.activity.dto.admin;

import com.trivallo.catalog.activity.ActivityStatus;
import com.trivallo.catalog.activity.ActivityType;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;

/** Everything the admin form needs, in every language. */
public record ActivityAdminResponse(
        long id,
        String slug,
        String citySlug,
        String categorySlug,
        ActivityType type,
        ActivityStatus status,
        BigDecimal priceAdultEur,
        BigDecimal priceChildEur,
        int durationMinutes,
        int maxGroupSize,
        List<DayOfWeek> operatingDays,
        String meetingPoint,
        BigDecimal latitude,
        BigDecimal longitude,
        String tripadvisorUrl,
        List<ActivityTranslationResponse> translations,
        List<AdminImageResponse> images,
        Instant createdAt,
        Instant updatedAt) {
}
