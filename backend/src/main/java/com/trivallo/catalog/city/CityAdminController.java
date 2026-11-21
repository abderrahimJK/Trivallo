package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.admin.CityAdminRequest;
import com.trivallo.catalog.city.dto.admin.CityAdminResponse;
import com.trivallo.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** ADMIN role only (see SecurityConfig: /api/v1/admin/**). */
@RestController
@RequestMapping("/api/v1/admin/cities")
@RequiredArgsConstructor
@Tag(name = "Admin: cities", description = "Manage destination cities")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class CityAdminController {

    private final CityAdminService cityAdminService;

    @GetMapping
    @Operation(summary = "List cities with all languages")
    public List<CityAdminResponse> list() {
        return cityAdminService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a city")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public CityAdminResponse create(@Valid @RequestBody CityAdminRequest request) {
        return cityAdminService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a city's slug, order and texts")
    @ApiResponse(responseCode = "404", description = "Unknown city")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public CityAdminResponse update(@PathVariable long id, @Valid @RequestBody CityAdminRequest request) {
        return cityAdminService.update(id, request);
    }

    @PutMapping(path = "/{id}/hero-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace the hero image (JPEG or PNG, up to 10 MB; resized to 640, 1280 and 1920 px wide)")
    @ApiResponse(responseCode = "400", description = "Empty file or not a supported image")
    public CityAdminResponse replaceHeroImage(@PathVariable long id, @RequestPart("file") MultipartFile file) {
        return cityAdminService.replaceHeroImage(id, file);
    }
}
