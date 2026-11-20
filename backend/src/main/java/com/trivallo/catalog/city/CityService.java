package com.trivallo.catalog.city;

import com.trivallo.catalog.city.dto.CityDetailResponse;
import com.trivallo.catalog.city.dto.CityResponse;
import com.trivallo.shared.i18n.AppLocale;
import com.trivallo.shared.i18n.Translations;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CityService {

    private final CityRepository cityRepository;
    private final CityMapper cityMapper;

    public List<CityResponse> findAll(AppLocale locale) {
        return cityRepository.findAllByOrderBySortOrderAsc().stream()
                .map(city -> cityMapper.toResponse(city, translationOf(city, locale)))
                .toList();
    }

    public CityDetailResponse findBySlug(String slug, AppLocale locale) {
        City city = cityRepository.findBySlug(slug)
                .orElseThrow(() -> new CityNotFoundException(slug));
        return cityMapper.toDetailResponse(city, translationOf(city, locale));
    }

    private CityTranslation translationOf(City city, AppLocale locale) {
        return Translations.resolve(city.getTranslations(), locale, "city " + city.getSlug());
    }
}
