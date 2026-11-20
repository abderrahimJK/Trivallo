package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.admin.CityAdminResponse;
import com.trivallo.catalog.city.dto.admin.CityTranslationInput;
import org.mapstruct.Mapper;

@Mapper
interface CityAdminMapper {

    CityAdminResponse toResponse(City city);

    CityTranslationInput toTranslation(CityTranslation translation);
}
