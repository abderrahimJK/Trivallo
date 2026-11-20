package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.CategoryResponse;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.i18n.Translations;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponse> findAll(AppLocale locale) {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream()
                .map(category -> categoryMapper.toResponse(
                        category,
                        Translations.resolve(category.getTranslations(), locale, "category " + category.getSlug())))
                .toList();
    }
}
