package com.trivallo.shared.i18n;

/** Data integrity problem: content exists without any usable translation. Surfaces as a 500. */
public class MissingTranslationException extends RuntimeException {

    public MissingTranslationException(String owner, AppLocale locale) {
        super("No '%s' or default translation for %s".formatted(locale.code(), owner));
    }
}
