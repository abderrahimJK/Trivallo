package com.trivallo.catalog.activity;

import com.trivallo.catalog.activity.dto.admin.ActivityAdminRequest;
import com.trivallo.catalog.activity.dto.admin.ActivityAdminResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityAdminSummaryResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityStatsResponse;
import com.trivallo.catalog.activity.dto.admin.ActivityStatusRequest;
import com.trivallo.catalog.activity.dto.admin.ImageOrderRequest;
import com.trivallo.shared.config.OpenApiConfig;
import com.trivallo.shared.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** ADMIN role only (see SecurityConfig: /api/v1/admin/**). */
@RestController
@RequestMapping("/api/v1/admin/activities")
@RequiredArgsConstructor
@Tag(name = "Admin: activities", description = "Create, edit, publish and illustrate activities")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class ActivityAdminController {

    private final ActivityAdminService activityAdminService;

    @GetMapping
    @Operation(summary = "List activities in any status, most recently changed first")
    public PageResponse<ActivityAdminSummaryResponse> list(
            @Parameter(description = "Only this status") @RequestParam(required = false) ActivityStatus status,
            @Parameter(description = "Only this city slug") @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return activityAdminService.list(status, city, page, size);
    }

    @GetMapping("/stats")
    @Operation(summary = "Counters for the admin dashboard")
    public ActivityStatsResponse stats() {
        return activityAdminService.stats();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an activity with all languages and images")
    @ApiResponse(responseCode = "404", description = "Unknown activity")
    public ActivityAdminResponse get(@PathVariable long id) {
        return activityAdminService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an activity (starts as DRAFT)")
    @ApiResponse(responseCode = "400", description = "Invalid field or broken rule, listed in errors")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public ActivityAdminResponse create(@Valid @RequestBody ActivityAdminRequest request) {
        return activityAdminService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace an activity's details and texts (status and images unchanged)")
    @ApiResponse(responseCode = "400", description = "Invalid field or broken rule, listed in errors")
    @ApiResponse(responseCode = "404", description = "Unknown activity")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public ActivityAdminResponse update(@PathVariable long id, @Valid @RequestBody ActivityAdminRequest request) {
        return activityAdminService.update(id, request);
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Publish, unpublish (DRAFT) or archive an activity")
    public ActivityAdminResponse changeStatus(@PathVariable long id, @Valid @RequestBody ActivityStatusRequest request) {
        return activityAdminService.changeStatus(id, request.status());
    }

    @PostMapping(path = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload an image (JPEG, PNG or WebP, up to 5 MB); it goes last in the gallery")
    @ApiResponse(responseCode = "400", description = "Empty file or not a supported image")
    @ApiResponse(responseCode = "413", description = "File too large")
    public ActivityAdminResponse addImage(
            @PathVariable long id,
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Describes the photo for screen readers and search engines")
            @RequestParam(required = false) @Size(max = 255) String altText) {
        return activityAdminService.addImage(id, file, altText);
    }

    @PutMapping("/{id}/images/order")
    @Operation(summary = "Reorder images; the first one is the cover")
    public ActivityAdminResponse reorderImages(@PathVariable long id, @Valid @RequestBody ImageOrderRequest request) {
        return activityAdminService.reorderImages(id, request.imageIds());
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @Operation(summary = "Remove an image and its file")
    public ActivityAdminResponse deleteImage(@PathVariable long id, @PathVariable long imageId) {
        return activityAdminService.deleteImage(id, imageId);
    }
}
