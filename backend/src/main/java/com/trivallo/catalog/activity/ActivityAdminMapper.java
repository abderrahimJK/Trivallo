package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.admin.ActivityAdminResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityTranslationResponse;
import com.trivallo.catalog.activity.dto.admin.AdminImageResponse;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/** Entity to admin responses. Requests are applied in {@link ActivityAdminService}, where the rules live. */
@Mapper
interface ActivityAdminMapper {

    @Mapping(target = "citySlug", source = "city.slug")
    @Mapping(target = "categorySlug", source = "category.slug")
    @Mapping(target = "operatingDays", source = "operatingDays", qualifiedByName = "sortedDays")
    ActivityAdminResponse toResponse(Activity activity);

    @Mapping(target = "included", source = "included", qualifiedByName = "lines")
    @Mapping(target = "notIncluded", source = "notIncluded", qualifiedByName = "lines")
    ActivityTranslationResponse toTranslationResponse(ActivityTranslation translation);

    AdminImageResponse toImageResponse(ActivityImage image);

    @Named("lines")
    default List<String> lines(String text) {
        return TextLines.split(text);
    }

    @Named("sortedDays")
    default List<DayOfWeek> sortedDays(Set<DayOfWeek> days) {
        return days == null ? List.of() : days.stream().sorted().toList();
    }
}
