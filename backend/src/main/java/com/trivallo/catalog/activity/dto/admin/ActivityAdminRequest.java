package com.trivallo.catalog.activity.dto.admin;

import com.trivallo.catalog.activity.ActivityType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import org.hibernate.validator.constraints.URL;

/**
 * Create or replace an activity. Cross-field rules (child price, coordinates, English text)
 * are checked by {@code ActivityRules} after these field constraints pass.
 */
public record ActivityAdminRequest(
        @Schema(example = "erg-chebbi-camel-trek")
        @NotBlank @Size(max = 160)
        @Pattern(regexp = "[a-z0-9]+(-[a-z0-9]+)*", message = "use lowercase letters, digits and hyphens")
        String slug,
        @NotBlank String citySlug,
        @NotBlank String categorySlug,
        @NotNull ActivityType type,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal priceAdultEur,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal priceChildEur,
        @Schema(description = "Minutes, up to 14 days") @NotNull @Min(15) @Max(20_160) Integer durationMinutes,
        @NotNull @Min(1) @Max(200) Integer maxGroupSize,
        @NotEmpty Set<DayOfWeek> operatingDays,
        @Size(max = 255) String meetingPoint,
        @DecimalMin("-90") @DecimalMax("90") @Digits(integer = 3, fraction = 6) BigDecimal latitude,
        @DecimalMin("-180") @DecimalMax("180") @Digits(integer = 3, fraction = 6) BigDecimal longitude,
        @URL(protocol = "https") @Size(max = 500) String tripadvisorUrl,
        @Schema(description = "English is required, French is optional (the site falls back to English)")
        @NotEmpty @Size(max = 2) List<@Valid @NotNull ActivityTranslationRequest> translations) {
}
