package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.admin.CategoryAdminRequest;
import com.trivallo.catalog.category.dto.admin.CategoryAdminResponse;
import com.trivallo.catalog.category.dto.admin.CategoryTranslationInput;
import com.trivallo.shared.exception.ConflictException;
import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import com.trivallo.shared.i18n.TranslationRules;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Back-office management of experience categories. */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategoryAdminService {

    private final CategoryRepository categoryRepository;
    private final CategoryAdminMapper mapper;

    @Transactional(readOnly = true)
    public List<CategoryAdminResponse> list() {
        return categoryRepository.findAllByOrderBySortOrderAsc().stream().map(mapper::toResponse).toList();
    }

    public CategoryAdminResponse create(CategoryAdminRequest request) {
        check(request);
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new ConflictException("Slug '%s' is already used by another category".formatted(request.slug()));
        }
        Category category = new Category();
        apply(request, category);
        Category saved = categoryRepository.save(category);
        log.info("Category created id={} slug={}", saved.getId(), saved.getSlug());
        return mapper.toResponse(saved);
    }

    public CategoryAdminResponse update(long id, CategoryAdminRequest request) {
        check(request);
        Category category = categoryRepository.findById(id).orElseThrow(() -> new CategoryNotFoundException(id));
        if (categoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new ConflictException("Slug '%s' is already used by another category".formatted(request.slug()));
        }
        apply(request, category);
        log.info("Category updated id={} slug={}", id, category.getSlug());
        return mapper.toResponse(categoryRepository.saveAndFlush(category));
    }

    private static void check(CategoryAdminRequest request) {
        List<Violation> violations = TranslationRules.check(
                request.translations().stream().map(CategoryTranslationInput::locale).toList(), "translations");
        if (!violations.isEmpty()) {
            throw new RuleViolationException(violations);
        }
    }

    private void apply(CategoryAdminRequest request, Category category) {
        category.setSlug(request.slug());
        category.setIcon(request.icon() == null || request.icon().isBlank() ? null : request.icon());
        category.setSortOrder(request.sortOrder());
        Set<String> locales = request.translations().stream()
                .map(CategoryTranslationInput::locale).collect(Collectors.toSet());
        category.getTranslations().removeIf(existing -> !locales.contains(existing.getLocale()));
        for (CategoryTranslationInput source : request.translations()) {
            CategoryTranslation target = category.getTranslations().stream()
                    .filter(existing -> existing.getLocale().equals(source.locale()))
                    .findFirst()
                    .orElseGet(() -> {
                        CategoryTranslation created = new CategoryTranslation();
                        created.setCategory(category);
                        created.setLocale(source.locale());
                        category.getTranslations().add(created);
                        return created;
                    });
            target.setName(source.name().strip());
        }
    }
}
