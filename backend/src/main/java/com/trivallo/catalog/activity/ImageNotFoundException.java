package com.trivallo.catalog.activity;

import com.trivallo.shared.exception.ResourceNotFoundException;

public class ImageNotFoundException extends ResourceNotFoundException {

    public ImageNotFoundException(long activityId, long imageId) {
        super("Image %d not found on activity %d".formatted(imageId, activityId));
    }
}
