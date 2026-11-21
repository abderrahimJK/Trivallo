package com.trivallo.catalog.activity;

import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import java.util.List;

/** Limits on an activity's gallery. Kept free of Spring and the database so it is cheap to unit test. */
final class ActivityImageRules {

    /** Enough for a full gallery; keeps detail pages and storage in check. */
    static final int MAX_IMAGES = 20;

    private ActivityImageRules() {
    }

    /** @throws RuleViolationException when one more image would exceed {@link #MAX_IMAGES} */
    static void checkCanAdd(int currentCount) {
        if (currentCount >= MAX_IMAGES) {
            throw new RuleViolationException(List.of(
                    new Violation("file", "an activity can have at most " + MAX_IMAGES + " images")));
        }
    }
}
