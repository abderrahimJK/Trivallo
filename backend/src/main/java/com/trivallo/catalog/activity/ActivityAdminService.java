package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.admin.ActivityAdminRequest;
import com.trivallo.catalog.activity.dto.admin.ActivityAdminResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityAdminSummaryResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityStatsResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityTranslationRequest;
import com.trivallo.catalog.category.Category;
import com.trivallo.catalog.category.CategoryRepository;
import com.trivallo.catalog.city.City;
import com.trivallo.catalog.city.CityRepository;
import com.trivallo.media.ImageStorage;
import com.trivallo.shared.exception.ConflictException;
import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.i18n.Translations;
import com.trivallo.shared.web.PageResponse;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Back-office management of activities: every status, every language, and their images. */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ActivityAdminService {

    private static final Sort LATEST_FIRST = Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));

    private final ActivityRepository activityRepository;
    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final ActivityAdminMapper mapper;
    private final ImageStorage imageStorage;

    @Transactional(readOnly = true)
    public PageResponse<ActivityAdminSummaryResponse> list(ActivityStatus status, String citySlug, int page, int size) {
        return PageResponse.from(activityRepository
                .findAll(ActivitySpecifications.adminMatching(status, citySlug), PageRequest.of(page, size, LATEST_FIRST))
                .map(this::toSummary));
    }

    @Transactional(readOnly = true)
    public ActivityStatsResponse stats() {
        return new ActivityStatsResponse(
                activityRepository.countByStatus(ActivityStatus.PUBLISHED),
                activityRepository.countByStatus(ActivityStatus.DRAFT),
                activityRepository.countByStatus(ActivityStatus.ARCHIVED),
                activityRepository.countWithoutImages(ActivityStatus.ARCHIVED),
                activityRepository.countWithoutTranslation(ActivityStatus.ARCHIVED, AppLocale.FR.code()));
    }

    @Transactional(readOnly = true)
    public ActivityAdminResponse get(long id) {
        return mapper.toResponse(find(id));
    }

    public ActivityAdminResponse create(ActivityAdminRequest request) {
        ActivityRules.check(request);
        if (activityRepository.existsBySlug(request.slug())) {
            throw new ConflictException("Slug '%s' is already used by another activity".formatted(request.slug()));
        }
        Activity activity = new Activity();
        apply(request, activity);
        Activity saved = activityRepository.save(activity);
        log.info("Activity created id={} slug={} status={}", saved.getId(), saved.getSlug(), saved.getStatus());
        return mapper.toResponse(saved);
    }

    public ActivityAdminResponse update(long id, ActivityAdminRequest request) {
        ActivityRules.check(request);
        Activity activity = find(id);
        if (activityRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new ConflictException("Slug '%s' is already used by another activity".formatted(request.slug()));
        }
        apply(request, activity);
        log.info("Activity updated id={} slug={}", id, activity.getSlug());
        return mapper.toResponse(activityRepository.saveAndFlush(activity));
    }

    public ActivityAdminResponse changeStatus(long id, ActivityStatus status) {
        Activity activity = find(id);
        ActivityStatus previous = activity.getStatus();
        activity.setStatus(status);
        log.info("Activity status changed id={} from={} to={}", id, previous, status);
        return mapper.toResponse(activityRepository.saveAndFlush(activity));
    }

    public ActivityAdminResponse addImage(long id, MultipartFile file, String altText) {
        Activity activity = find(id);
        String url = imageStorage.store(file, "activities/" + id, "file");
        int nextOrder = activity.getImages().stream().mapToInt(ActivityImage::getSortOrder).max().orElse(-1) + 1;
        ActivityImage image = new ActivityImage();
        image.setActivity(activity);
        image.setUrl(url);
        image.setAltText(blankToNull(altText));
        image.setSortOrder(nextOrder);
        activity.getImages().add(image);
        return mapper.toResponse(activityRepository.saveAndFlush(activity));
    }

    /** New order of the images; the first one becomes the cover. */
    public ActivityAdminResponse reorderImages(long id, List<Long> imageIds) {
        Activity activity = find(id);
        Map<Long, ActivityImage> byId = activity.getImages().stream()
                .collect(Collectors.toMap(ActivityImage::getId, Function.identity()));
        if (imageIds.size() != byId.size() || !byId.keySet().equals(new HashSet<>(imageIds))) {
            throw new RuleViolationException(List.of(
                    new Violation("imageIds", "must list every image of this activity exactly once")));
        }
        for (int position = 0; position < imageIds.size(); position++) {
            byId.get(imageIds.get(position)).setSortOrder(position);
        }
        activity.getImages().sort(Comparator.comparingInt(ActivityImage::getSortOrder));
        return mapper.toResponse(activityRepository.saveAndFlush(activity));
    }

    public ActivityAdminResponse deleteImage(long id, long imageId) {
        Activity activity = find(id);
        ActivityImage image = activity.getImages().stream()
                .filter(candidate -> Objects.equals(candidate.getId(), imageId))
                .findFirst()
                .orElseThrow(() -> new ImageNotFoundException(id, imageId));
        activity.getImages().remove(image);
        Activity saved = activityRepository.saveAndFlush(activity);
        imageStorage.delete(image.getUrl());
        return mapper.toResponse(saved);
    }

    private Activity find(long id) {
        return activityRepository.findById(id).orElseThrow(() -> new ActivityNotFoundException(id));
    }

    private void apply(ActivityAdminRequest request, Activity activity) {
        activity.setSlug(request.slug());
        activity.setCity(findCity(request.citySlug()));
        activity.setCategory(findCategory(request.categorySlug()));
        activity.setType(request.type());
        activity.setPriceAdultEur(request.priceAdultEur());
        activity.setPriceChildEur(request.priceChildEur());
        activity.setDurationMinutes(request.durationMinutes());
        activity.setMaxGroupSize(request.maxGroupSize());
        activity.setOperatingDays(EnumSet.copyOf(request.operatingDays()));
        activity.setMeetingPoint(blankToNull(request.meetingPoint()));
        activity.setLatitude(request.latitude());
        activity.setLongitude(request.longitude());
        activity.setTripadvisorUrl(blankToNull(request.tripadvisorUrl()));
        applyTranslations(request.translations(), activity);
    }

    /** Updates languages in place, adds new ones and drops the ones no longer sent. */
    private void applyTranslations(List<ActivityTranslationRequest> requested, Activity activity) {
        Set<String> requestedLocales = requested.stream().map(ActivityTranslationRequest::locale).collect(Collectors.toSet());
        activity.getTranslations().removeIf(existing -> !requestedLocales.contains(existing.getLocale()));
        for (ActivityTranslationRequest source : requested) {
            ActivityTranslation target = activity.getTranslations().stream()
                    .filter(existing -> existing.getLocale().equals(source.locale()))
                    .findFirst()
                    .orElseGet(() -> {
                        ActivityTranslation created = new ActivityTranslation();
                        created.setActivity(activity);
                        created.setLocale(source.locale());
                        activity.getTranslations().add(created);
                        return created;
                    });
            target.setTitle(source.title().strip());
            target.setSummary(blankToNull(source.summary()));
            target.setDescription(blankToNull(source.description()));
            target.setItinerary(blankToNull(source.itinerary()));
            target.setIncluded(TextLines.join(source.included()));
            target.setNotIncluded(TextLines.join(source.notIncluded()));
            target.setMetaTitle(blankToNull(source.metaTitle()));
            target.setMetaDescription(blankToNull(source.metaDescription()));
        }
    }

    private City findCity(String slug) {
        return cityRepository.findBySlug(slug).orElseThrow(() ->
                new RuleViolationException(List.of(new Violation("citySlug", "unknown city '%s'".formatted(slug)))));
    }

    private Category findCategory(String slug) {
        return categoryRepository.findBySlug(slug).orElseThrow(() ->
                new RuleViolationException(List.of(new Violation("categorySlug", "unknown category '%s'".formatted(slug)))));
    }

    private ActivityAdminSummaryResponse toSummary(Activity activity) {
        AppLocale english = AppLocale.DEFAULT;
        String title = Translations.resolve(activity.getTranslations(), english, "activity " + activity.getSlug()).getTitle();
        String cityName = Translations.resolve(activity.getCity().getTranslations(), english, "city").getName();
        String categoryName = Translations.resolve(activity.getCategory().getTranslations(), english, "category").getName();
        boolean frenchMissing = activity.getTranslations().stream()
                .noneMatch(translation -> AppLocale.FR.code().equals(translation.getLocale()));
        List<ActivityImage> images = activity.getImages();
        return new ActivityAdminSummaryResponse(
                activity.getId(),
                activity.getSlug(),
                title,
                cityName,
                categoryName,
                activity.getType(),
                activity.getStatus(),
                activity.getPriceAdultEur(),
                images.size(),
                images.isEmpty() ? null : images.getFirst().getUrl(),
                frenchMissing,
                activity.getUpdatedAt());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
