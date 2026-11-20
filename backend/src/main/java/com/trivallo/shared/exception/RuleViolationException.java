package com.trivallo.shared.exception;

import java.util.List;

/**
 * A request is well-formed but breaks a business rule that bean validation cannot express
 * on its own (e.g. a child price above the adult price). Mapped to HTTP 400 with the same
 * {@code errors} list as validation failures, so clients handle both the same way.
 */
public class RuleViolationException extends RuntimeException {

    /** One broken rule, tied to the request field the user has to change. */
    public record Violation(String field, String message) {
    }

    private final transient List<Violation> violations;

    public RuleViolationException(List<Violation> violations) {
        super("Request breaks %d business rule(s)".formatted(violations.size()));
        this.violations = List.copyOf(violations);
    }

    public List<Violation> getViolations() {
        return violations;
    }
}
