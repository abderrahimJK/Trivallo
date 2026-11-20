package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.admin.CityAdminRequest;
import com.trivallo.catalog.city.dto.admin.CityAdminResponse;
import com.trivallo.catalog.city.dto.admin.CityTranslationInput;
import com.trivallo.media.ImageStorage;
import com.trivallo.shared.exception.ConflictException;
import com.trivallo.shared.exception.RuleViolationException;
import com.trivallo.shared.exception.RuleViolationException.Violation;
import com.trivallo.shared.i18n.TranslationRules;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Back-office management of destination cities and their hero image. */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CityAdminService {

    private final CityRepository cityRepository;
    private final CityAdminMapper mapper;
    private final ImageStorage imageStorage;

    @Transactional(readOnly = true)
    public List<CityAdminResponse> list() {
        return cityRepository.findAllByOrderBySortOrderAsc().stream().map(mapper::toResponse).toList();
    }

    public CityAdminResponse create(CityAdminRequest request) {
        check(request);
        if (cityRepository.existsBySlug(request.slug())) {
            throw new ConflictException("Slug '%s' is already used by another city".formatted(request.slug()));
        }
        City city = new City();
        apply(request, city);
        City saved = cityRepository.save(city);
        log.info("City created id={} slug={}", saved.getId(), saved.getSlug());
        return mapper.toResponse(saved);
    }

    public CityAdminResponse update(long id, CityAdminRequest request) {
        check(request);
        City city = find(id);
        if (cityRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new ConflictException("Slug '%s' is already used by another city".formatted(request.slug()));
        }
        apply(request, city);
        log.info("City updated id={} slug={}", id, city.getSlug());
        return mapper.toResponse(cityRepository.saveAndFlush(city));
    }

    /** Replaces the hero image; the previous file is deleted. */
    public CityAdminResponse replaceHeroImage(long id, MultipartFile file) {
        City city = find(id);
        String previous = city.getHeroImageUrl();
        city.setHeroImageUrl(imageStorage.store(file, "cities/" + id, "file"));
        CityAdminResponse response = mapper.toResponse(cityRepository.saveAndFlush(city));
        imageStorage.delete(previous);
        return response;
    }

    private City find(long id) {
        return cityRepository.findById(id).orElseThrow(() -> new CityNotFoundException("#" + id));
    }

    private static void check(CityAdminRequest request) {
        List<Violation> violations = TranslationRules.check(
                request.translations().stream().map(CityTranslationInput::locale).toList(), "translations");
        if (!violations.isEmpty()) {
            throw new RuleViolationException(violations);
        }
    }

    private void apply(CityAdminRequest request, City city) {
        city.setSlug(request.slug());
        city.setSortOrder(request.sortOrder());
        Set<String> locales = request.translations().stream().map(CityTranslationInput::locale).collect(Collectors.toSet());
        city.getTranslations().removeIf(existing -> !locales.contains(existing.getLocale()));
        for (CityTranslationInput source : request.translations()) {
            CityTranslation target = city.getTranslations().stream()
                    .filter(existing -> existing.getLocale().equals(source.locale()))
                    .findFirst()
                    .orElseGet(() -> {
                        CityTranslation created = new CityTranslation();
                        created.setCity(city);
                        created.setLocale(source.locale());
                        city.getTranslations().add(created);
                        return created;
                    });
            target.setName(source.name().strip());
            target.setDescription(blankToNull(source.description()));
            target.setMetaTitle(blankToNull(source.metaTitle()));
            target.setMetaDescription(blankToNull(source.metaDescription()));
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.strip();
    }
}
