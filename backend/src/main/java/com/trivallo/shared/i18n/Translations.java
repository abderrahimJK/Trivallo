package com.trivallo.shared.i18n;

import java.util.Collection;
import java.util.Optional;

public final class Translations {

    private Translations() {
    }

    /**
     * Picks the translation for the requested locale, falling back to English so a
     * page never renders empty while a French text is still being written.
     *
     * @throws MissingTranslationException when neither the requested nor the default locale exists
     */
    public static <T extends Translation> T resolve(Collection<T> translations, AppLocale locale, String owner) {
        return find(translations, locale)
                .or(() -> find(translations, AppLocale.DEFAULT))
                .orElseThrow(() -> new MissingTranslationException(owner, locale));
    }

    private static <T extends Translation> Optional<T> find(Collection<T> translations, AppLocale locale) {
        return translations.stream()
                .filter(translation -> locale.code().equals(translation.getLocale()))
                .findFirst();
    }
}
