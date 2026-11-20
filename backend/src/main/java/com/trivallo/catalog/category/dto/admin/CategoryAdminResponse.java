package com.trivallo.catalog.category.dto.admin;

import java.util.List;

public record CategoryAdminResponse(
        long id,
        String slug,
        String icon,
        int sortOrder,
        List<CategoryTranslationInput> translations) {
}
