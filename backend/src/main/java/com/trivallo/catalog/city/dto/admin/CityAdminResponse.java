package com.trivallo.catalog.city.dto.admin;

import java.util.List;

public record CityAdminResponse(
        long id,
        String slug,
        String heroImageUrl,
        int sortOrder,
        List<CityTranslationInput> translations) {
}
