package com.trivallo.catalog.activity;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class TextLinesTest {

    @Test
    void joinsAndSplitsBackToTheSameItems() {
        List<String> items = List.of("Market visit", "Lunch");
        assertThat(TextLines.split(TextLines.join(items))).isEqualTo(items);
    }

    @Test
    void dropsBlankItemsAndTrimsSpaces() {
        assertThat(TextLines.join(List.of("  Lunch ", " ", ""))).isEqualTo("Lunch");
    }

    @Test
    void lineBreakInsideAnItemDoesNotCreateANewItem() {
        assertThat(TextLines.split(TextLines.join(List.of("Hotel\npick-up")))).containsExactly("Hotel pick-up");
    }

    @Test
    void emptyListIsStoredAsNull() {
        assertThat(TextLines.join(List.of())).isNull();
        assertThat(TextLines.split(null)).isEmpty();
    }
}
