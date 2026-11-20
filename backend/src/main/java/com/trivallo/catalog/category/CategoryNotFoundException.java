package com.trivallo.catalog.category;

import com.trivallo.shared.exception.ResourceNotFoundException;

public class CategoryNotFoundException extends ResourceNotFoundException {

    public CategoryNotFoundException(long id) {
        super("Category with id %d not found".formatted(id));
    }
}
