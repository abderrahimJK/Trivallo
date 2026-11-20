package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.CityDetailResponse;
import com.trivallo.catalog.city.dto.CityResponse;
import com.trivallo.shared.i18n.AppLocale;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cities")
@RequiredArgsConstructor
@Tag(name = "Cities", description = "Public city pages")
public class CityController {

    private final CityService cityService;

    @GetMapping
    @Operation(summary = "List cities in display order")
    public List<CityResponse> findAll(@Parameter(hidden = true) Locale locale) {
        return cityService.findAll(AppLocale.from(locale));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get a city page by slug")
    @ApiResponse(responseCode = "200", description = "City found")
    @ApiResponse(responseCode = "404", description = "No city with this slug")
    public CityDetailResponse findBySlug(@PathVariable String slug, @Parameter(hidden = true) Locale locale) {
        return cityService.findBySlug(slug, AppLocale.from(locale));
    }
}
