package com.trivallo.catalog.activity.dto.admin;

/** Dashboard counters. "Missing" counts ignore archived activities. */
public record ActivityStatsResponse(
        long published,
        long draft,
        long archived,
        long missingImages,
        long missingFrench) {
}
