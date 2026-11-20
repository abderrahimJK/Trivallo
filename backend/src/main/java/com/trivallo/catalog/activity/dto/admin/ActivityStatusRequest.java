package com.trivallo.catalog.activity.dto.admin;

import com.trivallo.catalog.activity.ActivityStatus;
import jakarta.validation.constraints.NotNull;

public record ActivityStatusRequest(@NotNull ActivityStatus status) {
}
