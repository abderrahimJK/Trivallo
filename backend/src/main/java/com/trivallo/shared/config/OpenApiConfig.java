package com.trivallo.shared.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "Trivallo API",
        version = "v1",
        description = "Excursions and activities in Marrakech, Ouarzazate and Merzouga. "
                + "Send Accept-Language: en or fr to choose the content language."))
@SecurityScheme(
        name = OpenApiConfig.BEARER_SCHEME,
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Access token issued by Keycloak (realm 'trivallo')")
public class OpenApiConfig {

    public static final String BEARER_SCHEME = "keycloak";
}
