package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.CategoryResponse;
import com.trivallo.shared.i18n.AppLocale;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Activity categories for filters")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List categories in display order")
    public List<CategoryResponse> findAll(@Parameter(hidden = true) Locale locale) {
        return categoryService.findAll(AppLocale.from(locale));
    }
}
