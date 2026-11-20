package com.trivallo.catalog.activity;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {

    Optional<Activity> findBySlugAndStatus(String slug, ActivityStatus status);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    long countByStatus(ActivityStatus status);

    @Query("select count(a) from Activity a where a.status <> :excluded and a.images is empty")
    long countWithoutImages(@Param("excluded") ActivityStatus excluded);

    @Query("""
            select count(a) from Activity a where a.status <> :excluded and not exists (
                select t from ActivityTranslation t where t.activity = a and t.locale = :locale)""")
    long countWithoutTranslation(@Param("excluded") ActivityStatus excluded, @Param("locale") String locale);
}
