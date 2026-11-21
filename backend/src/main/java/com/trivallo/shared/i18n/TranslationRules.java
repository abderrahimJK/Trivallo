package com.trivallo.shared.i18n;

import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Rules every translatable admin form shares: one text per language, English always present. */
public final class TranslationRules {

    private TranslationRules() {
    }

    public static List<Violation> check(Collection<String> locales, String field) {
        List<Violation> violations = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String locale : locales) {
            if (!seen.add(locale)) {
                violations.add(new Violation(field, "only one text per language (%s given twice)".formatted(locale)));
            }
        }
        // English is the public site's fallback language, so it is always required.
        if (!seen.contains(AppLocale.DEFAULT.code())) {
            violations.add(new Violation(field, "English text is required"));
        }
        return violations;
    }
}
