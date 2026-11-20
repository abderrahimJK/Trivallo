package com.trivallo.catalog.activity;

/** Only {@link #PUBLISHED} activities are visible on the public API. */
public enum ActivityStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
