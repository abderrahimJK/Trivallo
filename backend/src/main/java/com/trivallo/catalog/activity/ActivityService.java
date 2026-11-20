package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.ActivityDetailResponse;
import com.trivallo.catalog.activity.dto.ActivitySearchCriteria;
import com.trivallo.catalog.activity.dto.ActivitySummaryResponse;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.i18n.Translations;
import com.trivallo.shared.web.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityService {

    /** Newest first; id breaks ties so paging is stable. */
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final ActivityRepository activityRepository;
    private final ActivityMapper activityMapper;

    public PageResponse<ActivitySummaryResponse> search(ActivitySearchCriteria criteria, int page, int size, AppLocale locale) {
        Pageable pageable = PageRequest.of(page, size, DEFAULT_SORT);
        return PageResponse.from(activityRepository
                .findAll(ActivitySpecifications.publishedMatching(criteria), pageable)
                .map(activity -> activityMapper.toSummaryResponse(activity, translationOf(activity, locale), locale)));
    }

    public ActivityDetailResponse findPublishedBySlug(String slug, AppLocale locale) {
        Activity activity = activityRepository.findBySlugAndStatus(slug, ActivityStatus.PUBLISHED)
                .orElseThrow(() -> new ActivityNotFoundException(slug));
        return activityMapper.toDetailResponse(activity, translationOf(activity, locale), locale);
    }

    private ActivityTranslation translationOf(Activity activity, AppLocale locale) {
        return Translations.resolve(activity.getTranslations(), locale, "activity " + activity.getSlug());
    }
}
