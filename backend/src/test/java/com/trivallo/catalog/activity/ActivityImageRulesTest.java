package com.trivallo.catalog.activity;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.trivallo.shared.exception.RuleViolationException;
import org.junit.jupiter.api.Test;

class ActivityImageRulesTest {

    @Test
    void acceptsTheTwentiethImage() {
        assertThatCode(() -> ActivityImageRules.checkCanAdd(19)).doesNotThrowAnyException();
    }

    @Test
    void refusesATwentyFirstImage() {
        assertThatThrownBy(() -> ActivityImageRules.checkCanAdd(20))
                .isInstanceOf(RuleViolationException.class)
                .hasFieldOrPropertyWithValue("violations",
                        java.util.List.of(new RuleViolationException.Violation("file", "an activity can have at most 20 images")));
    }
}
