package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.CityDetailResponse;
import com.trivallo.catalog.city.dto.CityResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface CityMapper {

    @Mapping(target = "slug", source = "city.slug")
    @Mapping(target = "heroImageUrl", source = "city.heroImageUrl")
    @Mapping(target = "name", source = "translation.name")
    @Mapping(target = "description", source = "translation.description")
    CityResponse toResponse(City city, CityTranslation translation);

    @Mapping(target = "slug", source = "city.slug")
    @Mapping(target = "heroImageUrl", source = "city.heroImageUrl")
    @Mapping(target = "name", source = "translation.name")
    @Mapping(target = "description", source = "translation.description")
    @Mapping(target = "metaTitle", source = "translation.metaTitle")
    @Mapping(target = "metaDescription", source = "translation.metaDescription")
    @Mapping(target = "locale", source = "translation.locale")
    CityDetailResponse toDetailResponse(City city, CityTranslation translation);
}
