package com.trivallo.catalog.activity.dto.admin;

import com.trivallo.catalog.activity.ActivityStatus;
import com.trivallo.catalog.activity.ActivityType;
import java.math.BigDecimal;
import java.time.Instant;

/** One row of the admin activity table (English names). */
public record ActivityAdminSummaryResponse(
        long id,
        String slug,
        String title,
        String cityName,
        String categoryName,
        ActivityType type,
        ActivityStatus status,
        BigDecimal priceAdultEur,
        int imageCount,
        String coverImageUrl,
        boolean frenchMissing,
        Instant updatedAt) {
}
