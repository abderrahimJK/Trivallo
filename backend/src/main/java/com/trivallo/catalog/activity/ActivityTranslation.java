package com.trivallo.catalog.activity;

import com.trivallo.shared.i18n.Translation;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "activity_translation")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ActivityTranslation implements Translation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(nullable = false, length = 5)
    private String locale;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String itinerary;

    /** One item per line. */
    @Column(columnDefinition = "text")
    private String included;

    /** One item per line. */
    @Column(name = "not_included", columnDefinition = "text")
    private String notIncluded;

    @Column(name = "meta_title", length = 120)
    private String metaTitle;

    @Column(name = "meta_description", length = 320)
    private String metaDescription;
}
