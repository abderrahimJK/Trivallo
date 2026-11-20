package com.trivallo.catalog.activity.dto.admin;

import java.util.List;

public record ActivityTranslationResponse(
        String locale,
        String title,
        String summary,
        String description,
        String itinerary,
        List<String> included,
        List<String> notIncluded,
        String metaTitle,
        String metaDescription) {
}
