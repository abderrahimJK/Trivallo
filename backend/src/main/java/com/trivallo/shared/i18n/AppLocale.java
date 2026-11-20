package com.trivallo.shared.i18n;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Locales Trivallo serves content in. Adding a language means adding a constant here
 * and translation rows in the database, not new columns.
 */
public enum AppLocale {
    EN("en"),
    FR("fr");

    public static final AppLocale DEFAULT = EN;

    private final String code;

    AppLocale(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }

    public Locale toLocale() {
        return Locale.forLanguageTag(code);
    }

    /** Maps a resolved request locale to a supported one, falling back to {@link #DEFAULT}. */
    public static AppLocale from(Locale locale) {
        if (locale == null) {
            return DEFAULT;
        }
        return Arrays.stream(values())
                .filter(appLocale -> appLocale.code.equals(locale.getLanguage()))
                .findFirst()
                .orElse(DEFAULT);
    }

    public static List<Locale> supportedLocales() {
        return Arrays.stream(values()).map(AppLocale::toLocale).toList();
    }
}
