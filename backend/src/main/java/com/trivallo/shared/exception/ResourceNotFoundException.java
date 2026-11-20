package com.trivallo.shared.exception;

/** Base type for every "this resource does not exist" error; mapped to HTTP 404. */
public abstract class ResourceNotFoundException extends RuntimeException {

    protected ResourceNotFoundException(String message) {
        super(message);
    }
}
