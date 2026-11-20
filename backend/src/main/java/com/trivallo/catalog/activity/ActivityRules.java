package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.admin.ActivityAdminRequest;
import com.trivallo.catalog.activity.dto.admin.ActivityTranslationRequest;
import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import com.trivallo.shared.i18n.TranslationRules;
import java.util.ArrayList;
import java.util.List;

/**
 * Cross-field rules for an activity that field annotations cannot express. Kept free of
 * Spring and the database so it is cheap to unit test.
 */
final class ActivityRules {

    private ActivityRules() {
    }

    /** @throws RuleViolationException listing every broken rule at once, so the form can show them together */
    static void check(ActivityAdminRequest request) {
        List<Violation> violations = new ArrayList<>();

        // Pricing: a child place never costs more than an adult one.
        if (request.priceChildEur().compareTo(request.priceAdultEur()) > 0) {
            violations.add(new Violation("priceChildEur", "must not be higher than the adult price"));
        }

        // A map pin needs both coordinates.
        if ((request.latitude() == null) != (request.longitude() == null)) {
            violations.add(new Violation("latitude", "latitude and longitude must be given together"));
        }

        violations.addAll(TranslationRules.check(
                request.translations().stream().map(ActivityTranslationRequest::locale).toList(), "translations"));

        if (!violations.isEmpty()) {
            throw new RuleViolationException(violations);
        }
    }
}
