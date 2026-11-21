package com.trivallo.shared.web;

import com.trivallo.shared.exception.ConflictException;
import com.trivallo.shared.exception.ResourceNotFoundException;
import com.trivallo.shared.exception.RuleViolationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSourceResolvable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.validation.method.ParameterErrors;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Single place that turns exceptions into RFC 9457 {@link ProblemDetail} responses.
 * Spring MVC's own errors (type mismatch, 405, unknown path, ...) are handled by the
 * parent class in the same format; validation errors additionally list each invalid field.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String ERRORS_PROPERTY = "errors";

    /** One invalid input, e.g. {@code {"field": "size", "message": "must be less than or equal to 50"}}. */
    public record InvalidField(String field, String message) {
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Resource not found");
        return problem;
    }

    @ExceptionHandler(ConflictException.class)
    ProblemDetail handleConflict(ConflictException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Conflict");
        return problem;
    }

    @ExceptionHandler(RuleViolationException.class)
    ProblemDetail handleRuleViolation(RuleViolationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "One or more request values are invalid.");
        problem.setTitle("Bad Request");
        problem.setProperty(ERRORS_PROPERTY, exception.getViolations().stream()
                .map(violation -> new InvalidField(violation.field(), violation.message()))
                .toList());
        return problem;
    }

    /**
     * Re-thrown so Spring Security answers with 401/403 instead of the catch-all 500 below
     * (matters once method security such as {@code @PreAuthorize} is used).
     */
    @ExceptionHandler({AccessDeniedException.class, AuthenticationException.class})
    void rethrowSecurityException(RuntimeException exception) {
        throw exception;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception exception) {
        log.error("Unhandled exception", exception);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
        problem.setTitle("Internal server error");
        return problem;
    }

    /** Body or query-object binding failed (bad value, failed {@code @Valid} constraint). */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<InvalidField> errors = exception.getBindingResult().getAllErrors().stream()
                .map(GlobalExceptionHandler::toInvalidField)
                .toList();
        return validationProblem(exception.getBody(), errors, headers, status, request);
    }

    /** Constraint on a controller parameter failed (e.g. {@code @Max} on {@code size}), possibly together with a {@code @Valid} object. */
    @Override
    protected ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<InvalidField> errors = exception.getParameterValidationResults().stream()
                .flatMap(result -> invalidFieldsOf(result).stream())
                .toList();
        return validationProblem(exception.getBody(), errors, headers, status, request);
    }

    private ResponseEntity<Object> validationProblem(
            ProblemDetail problem, List<InvalidField> errors, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        problem.setDetail("One or more request values are invalid.");
        problem.setProperty(ERRORS_PROPERTY, errors);
        return handleExceptionInternal((Exception) null, problem, headers, status, request);
    }

    private static List<InvalidField> invalidFieldsOf(ParameterValidationResult result) {
        if (result instanceof ParameterErrors parameterErrors) {
            return parameterErrors.getAllErrors().stream()
                    .map(GlobalExceptionHandler::toInvalidField)
                    .toList();
        }
        String parameterName = result.getMethodParameter().getParameterName();
        return result.getResolvableErrors().stream()
                .map(error -> new InvalidField(parameterName, error.getDefaultMessage()))
                .toList();
    }

    private static InvalidField toInvalidField(MessageSourceResolvable error) {
        if (error instanceof FieldError fieldError) {
            String message = fieldError.isBindingFailure()
                    ? "invalid value '%s'".formatted(fieldError.getRejectedValue())
                    : fieldError.getDefaultMessage();
            return new InvalidField(fieldError.getField(), message);
        }
        return new InvalidField(null, error.getDefaultMessage());
    }
}
