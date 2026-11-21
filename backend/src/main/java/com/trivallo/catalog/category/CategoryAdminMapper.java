package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.admin.CategoryAdminResponse;
import com.trivallo.catalog.category.dto.admin.CategoryTranslationInput;
import org.mapstruct.Mapper;

@Mapper
interface CategoryAdminMapper {

    CategoryAdminResponse toResponse(Category category);

    CategoryTranslationInput toTranslation(CategoryTranslation translation);
}
