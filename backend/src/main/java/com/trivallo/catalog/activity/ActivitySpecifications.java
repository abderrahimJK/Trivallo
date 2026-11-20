package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.ActivitySearchCriteria;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.stream.Stream;
import org.springframework.data.jpa.domain.Specification;

/**
 * Builds the public activity search: published only, plus whichever filters were sent.
 * A filter that was not sent returns {@code null} and is dropped.
 */
final class ActivitySpecifications {

    private ActivitySpecifications() {
    }

    static Specification<Activity> publishedMatching(ActivitySearchCriteria criteria) {
        return Specification.allOf(Stream.of(
                hasStatus(ActivityStatus.PUBLISHED),
                inCity(criteria.city()),
                inCategory(criteria.category()),
                ofType(criteria.type()),
                adultPriceAtLeast(criteria.minPrice()),
                adultPriceAtMost(criteria.maxPrice()),
                durationAtLeast(criteria.minDuration()),
                durationAtMost(criteria.maxDuration()))
                .filter(Objects::nonNull)
                .toList());
    }

    private static Specification<Activity> hasStatus(ActivityStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private static Specification<Activity> inCity(String citySlug) {
        return citySlug == null ? null
                : (root, query, cb) -> cb.equal(root.join("city").get("slug"), citySlug);
    }

    private static Specification<Activity> inCategory(String categorySlug) {
        return categorySlug == null ? null
                : (root, query, cb) -> cb.equal(root.join("category").get("slug"), categorySlug);
    }

    private static Specification<Activity> ofType(ActivityType type) {
        return type == null ? null
                : (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    private static Specification<Activity> adultPriceAtLeast(BigDecimal min) {
        return min == null ? null
                : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("priceAdultEur"), min);
    }

    private static Specification<Activity> adultPriceAtMost(BigDecimal max) {
        return max == null ? null
                : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("priceAdultEur"), max);
    }

    private static Specification<Activity> durationAtLeast(Integer minMinutes) {
        return minMinutes == null ? null
                : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("durationMinutes"), minMinutes);
    }

    private static Specification<Activity> durationAtMost(Integer maxMinutes) {
        return maxMinutes == null ? null
                : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("durationMinutes"), maxMinutes);
    }
}
