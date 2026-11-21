package com.trivallo.catalog.activity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trivallo.catalog.activity.dto.admin.ActivityAdminRequest;
import com.trivallo.catalog.activity.dto.admin.ActivityTranslationRequest;
import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ActivityRulesTest {

    @Test
    void acceptsValidActivity() {
        assertThatCode(() -> ActivityRules.check(request("45.00", "30.00", null, null, List.of(text("en"), text("fr")))))
                .doesNotThrowAnyException();
    }

    @Test
    void acceptsChildPriceEqualToAdultPrice() {
        assertThatCode(() -> ActivityRules.check(request("45.00", "45.00", null, null, List.of(text("en")))))
                .doesNotThrowAnyException();
    }

    @Test
    void acceptsFreeChildPlace() {
        assertThatCode(() -> ActivityRules.check(request("45.00", "0.00", null, null, List.of(text("en")))))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsChildPriceAboveAdultPrice() {
        assertThat(violationsOf(request("45.00", "45.01", null, null, List.of(text("en")))))
                .containsExactly(new Violation("priceChildEur", "must not be higher than the adult price"));
    }

    @Test
    void comparesPricesByValueNotScale() {
        // 45.0 and 45.00 are the same amount; BigDecimal.equals would say otherwise.
        assertThatCode(() -> ActivityRules.check(request("45.0", "45.00", null, null, List.of(text("en")))))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsLatitudeWithoutLongitude() {
        assertThat(violationsOf(request("45.00", "30.00", new BigDecimal("31.6295"), null, List.of(text("en")))))
                .extracting(Violation::field)
                .containsExactly("latitude");
    }

    @Test
    void acceptsBothCoordinates() {
        assertThatCode(() -> ActivityRules.check(request(
                "45.00", "30.00", new BigDecimal("31.6295"), new BigDecimal("-7.9811"), List.of(text("en")))))
                .doesNotThrowAnyException();
    }

    @Test
    void requiresEnglishText() {
        assertThat(violationsOf(request("45.00", "30.00", null, null, List.of(text("fr")))))
                .containsExactly(new Violation("translations", "English text is required"));
    }

    @Test
    void rejectsTheSameLanguageTwice() {
        assertThat(violationsOf(request("45.00", "30.00", null, null, List.of(text("en"), text("en")))))
                .extracting(Violation::message)
                .containsExactly("only one text per language (en given twice)");
    }

    @Test
    void reportsEveryBrokenRuleAtOnce() {
        assertThat(violationsOf(request("10.00", "20.00", null, new BigDecimal("-7.98"), List.of(text("fr")))))
                .extracting(Violation::field)
                .containsExactly("priceChildEur", "latitude", "translations");
    }

    private static List<Violation> violationsOf(ActivityAdminRequest request) {
        try {
            ActivityRules.check(request);
        } catch (RuleViolationException exception) {
            return exception.getViolations();
        }
        throw new AssertionError("expected a RuleViolationException");
    }

    private static ActivityAdminRequest request(
            String adult, String child, BigDecimal latitude, BigDecimal longitude, List<ActivityTranslationRequest> texts) {
        return new ActivityAdminRequest(
                "erg-chebbi-camel-trek", "merzouga", "camel-rides", ActivityType.EXCURSION,
                new BigDecimal(adult), new BigDecimal(child), 1080, 12, Set.of(DayOfWeek.MONDAY),
                null, latitude, longitude, null, texts);
    }

    private static ActivityTranslationRequest text(String locale) {
        return new ActivityTranslationRequest(locale, "Camel trek", null, null, null, null, null, null, null);
    }
}
