package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.ActivityDetailResponse;
import com.trivallo.catalog.activity.dto.ActivitySearchCriteria;
import com.trivallo.catalog.activity.dto.ActivitySummaryResponse;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
@Tag(name = "Activities", description = "Public excursion and activity catalogue")
public class ActivityController {

    private static final int MAX_PAGE_SIZE = 50;

    private final ActivityService activityService;

    @GetMapping
    @Operation(summary = "Search published activities", description = "All filters are optional and combined with AND. Newest first.")
    @ApiResponse(responseCode = "200", description = "A page of activities")
    @ApiResponse(responseCode = "400", description = "Invalid filter or paging value")
    public PageResponse<ActivitySummaryResponse> search(
            @Valid @ParameterObject @ModelAttribute ActivitySearchCriteria criteria,
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size, at most 50") @RequestParam(defaultValue = "12") @Min(1) @Max(MAX_PAGE_SIZE) int size,
            @Parameter(hidden = true) Locale locale) {
        return activityService.search(criteria, page, size, AppLocale.from(locale));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a published activity by slug")
    @ApiResponse(responseCode = "200", description = "Activity found")
    @ApiResponse(responseCode = "404", description = "No published activity with this slug")
    public ActivityDetailResponse findBySlug(@PathVariable String slug, @Parameter(hidden = true) Locale locale) {
        return activityService.findPublishedBySlug(slug, AppLocale.from(locale));
    }
}
