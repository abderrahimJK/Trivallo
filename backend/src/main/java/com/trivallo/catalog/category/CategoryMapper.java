package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.CategoryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CategoryMapper {

    @Mapping(target = "slug", source = "category.slug")
    @Mapping(target = "icon", source = "category.icon")
    @Mapping(target = "name", source = "translation.name")
    CategoryResponse toResponse(Category category, CategoryTranslation translation);
}
