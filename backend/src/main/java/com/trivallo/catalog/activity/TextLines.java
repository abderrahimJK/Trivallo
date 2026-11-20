package com.trivallo.catalog.activity;

import java.util.List;

/** "Included" and "not included" are stored as one item per line in a text column. */
final class TextLines {

    private TextLines() {
    }

    /** Splits the column into items, ignoring blank lines. */
    static List<String> split(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }
        return text.lines().map(String::strip).filter(line -> !line.isEmpty()).toList();
    }

    /** Joins items back into the column; line breaks inside an item would create extra items, so they become spaces. */
    static String join(List<String> items) {
        if (items == null || items.isEmpty()) {
            return null;
        }
        List<String> cleaned = items.stream()
                .map(item -> item.replaceAll("\\R", " ").strip())
                .filter(item -> !item.isEmpty())
                .toList();
        return cleaned.isEmpty() ? null : String.join("\n", cleaned);
    }
}
