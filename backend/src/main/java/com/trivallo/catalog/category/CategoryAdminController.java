package com.trivallo.catalog.category;

import com.trivallo.catalog.category.dto.admin.CategoryAdminRequest;
import com.trivallo.catalog.category.dto.admin.CategoryAdminResponse;
import com.trivallo.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** ADMIN role only (see SecurityConfig: /api/v1/admin/**). */
@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin: categories", description = "Manage experience categories")
@SecurityRequirement(name = OpenApiConfig.BEARER_SCHEME)
public class CategoryAdminController {

    private final CategoryAdminService categoryAdminService;

    @GetMapping
    @Operation(summary = "List categories with all languages")
    public List<CategoryAdminResponse> list() {
        return categoryAdminService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public CategoryAdminResponse create(@Valid @RequestBody CategoryAdminRequest request) {
        return categoryAdminService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category's slug, icon, order and names")
    @ApiResponse(responseCode = "404", description = "Unknown category")
    @ApiResponse(responseCode = "409", description = "Slug already used")
    public CategoryAdminResponse update(@PathVariable long id, @Valid @RequestBody CategoryAdminRequest request) {
        return categoryAdminService.update(id, request);
    }
}
