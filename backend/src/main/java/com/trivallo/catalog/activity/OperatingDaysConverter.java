package com.trivallo.catalog.activity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.Set;
import java.util.stream.Collectors;

/** Stores operating days as a readable list, e.g. {@code MONDAY,WEDNESDAY,SATURDAY}. */
@Converter
public class OperatingDaysConverter implements AttributeConverter<Set<DayOfWeek>, String> {

    private static final String SEPARATOR = ",";

    @Override
    public String convertToDatabaseColumn(Set<DayOfWeek> days) {
        if (days == null || days.isEmpty()) {
            return "";
        }
        return days.stream()
                .sorted()
                .map(DayOfWeek::name)
                .collect(Collectors.joining(SEPARATOR));
    }

    @Override
    public Set<DayOfWeek> convertToEntityAttribute(String column) {
        if (column == null || column.isBlank()) {
            return EnumSet.noneOf(DayOfWeek.class);
        }
        return Arrays.stream(column.split(SEPARATOR))
                .map(String::trim)
                .map(DayOfWeek::valueOf)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(DayOfWeek.class)));
    }
}
