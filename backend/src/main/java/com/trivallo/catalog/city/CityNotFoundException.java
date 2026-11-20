package com.trivallo.catalog.city;

import com.trivallo.shared.exception.ResourceNotFoundException;

public class CityNotFoundException extends ResourceNotFoundException {

    public CityNotFoundException(String slug) {
        super("City '%s' not found".formatted(slug));
    }
}
