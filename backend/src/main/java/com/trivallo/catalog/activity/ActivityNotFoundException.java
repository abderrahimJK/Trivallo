package com.trivallo.catalog.activity;

import com.trivallo.shared.exception.ResourceNotFoundException;

public class ActivityNotFoundException extends ResourceNotFoundException {

    public ActivityNotFoundException(String slug) {
        super("Activity '%s' not found".formatted(slug));
    }
}
