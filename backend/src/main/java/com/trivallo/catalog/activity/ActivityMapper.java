package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.ActivityDetailResponse;
import com.trivallo.catalog.activity.dto.ActivityImageResponse;
import com.trivallo.catalog.activity.dto.ActivitySummaryResponse;
import com.trivallo.catalog.activity.dto.CityRefResponse;
import com.trivallo.catalog.category.Category;
import com.trivallo.catalog.category.CategoryTranslation;
import com.trivallo.catalog.category.dto.CategoryResponse;
import com.trivallo.catalog.city.City;
import com.trivallo.catalog.city.CityTranslation;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.i18n.Translations;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Maps an activity plus its already-resolved translation to API responses. The city and
 * category names are resolved in the same locale through the {@link Context} parameter.
 */
@Mapper
public interface ActivityMapper {

    @Mapping(target = "slug", source = "activity.slug")
    @Mapping(target = "type", source = "activity.type")
    @Mapping(target = "title", source = "translation.title")
    @Mapping(target = "summary", source = "translation.summary")
    @Mapping(target = "city", source = "activity.city")
    @Mapping(target = "category", source = "activity.category")
    @Mapping(target = "priceAdultEur", source = "activity.priceAdultEur")
    @Mapping(target = "priceChildEur", source = "activity.priceChildEur")
    @Mapping(target = "durationMinutes", source = "activity.durationMinutes")
    @Mapping(target = "coverImageUrl", source = "activity.images", qualifiedByName = "coverImageUrl")
    ActivitySummaryResponse toSummaryResponse(Activity activity, ActivityTranslation translation, @Context AppLocale locale);

    @Mapping(target = "slug", source = "activity.slug")
    @Mapping(target = "type", source = "activity.type")
    @Mapping(target = "title", source = "translation.title")
    @Mapping(target = "summary", source = "translation.summary")
    @Mapping(target = "description", source = "translation.description")
    @Mapping(target = "itinerary", source = "translation.itinerary")
    @Mapping(target = "included", source = "translation.included", qualifiedByName = "lines")
    @Mapping(target = "notIncluded", source = "translation.notIncluded", qualifiedByName = "lines")
    @Mapping(target = "city", source = "activity.city")
    @Mapping(target = "category", source = "activity.category")
    @Mapping(target = "priceAdultEur", source = "activity.priceAdultEur")
    @Mapping(target = "priceChildEur", source = "activity.priceChildEur")
    @Mapping(target = "durationMinutes", source = "activity.durationMinutes")
    @Mapping(target = "maxGroupSize", source = "activity.maxGroupSize")
    @Mapping(target = "operatingDays", source = "activity.operatingDays", qualifiedByName = "sortedDays")
    @Mapping(target = "meetingPoint", source = "activity.meetingPoint")
    @Mapping(target = "latitude", source = "activity.latitude")
    @Mapping(target = "longitude", source = "activity.longitude")
    @Mapping(target = "tripadvisorUrl", source = "activity.tripadvisorUrl")
    @Mapping(target = "images", source = "activity.images")
    @Mapping(target = "metaTitle", source = "translation.metaTitle")
    @Mapping(target = "metaDescription", source = "translation.metaDescription")
    @Mapping(target = "locale", source = "translation.locale")
    ActivityDetailResponse toDetailResponse(Activity activity, ActivityTranslation translation, @Context AppLocale locale);

    ActivityImageResponse toImageResponse(ActivityImage image);

    default CityRefResponse toCityRef(City city, @Context AppLocale locale) {
        CityTranslation translation = Translations.resolve(city.getTranslations(), locale, "city " + city.getSlug());
        return new CityRefResponse(city.getSlug(), translation.getName());
    }

    default CategoryResponse toCategoryResponse(Category category, @Context AppLocale locale) {
        CategoryTranslation translation =
                Translations.resolve(category.getTranslations(), locale, "category " + category.getSlug());
        return new CategoryResponse(category.getSlug(), translation.getName(), category.getIcon());
    }

    @Named("coverImageUrl")
    default String coverImageUrl(List<ActivityImage> images) {
        return images == null || images.isEmpty() ? null : images.getFirst().getUrl();
    }

    /** Splits a one-item-per-line text column into a list, ignoring blank lines. */
    @Named("lines")
    default List<String> lines(String text) {
        return TextLines.split(text);
    }

    @Named("sortedDays")
    default List<DayOfWeek> sortedDays(Set<DayOfWeek> days) {
        return days == null ? List.of() : days.stream().sorted().toList();
    }
}
