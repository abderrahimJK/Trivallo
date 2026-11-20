package com.trivallo.catalog.activity;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ActivityRepository extends JpaRepository<Activity, Long>, JpaSpecificationExecutor<Activity> {

    Optional<Activity> findBySlugAndStatus(String slug, ActivityStatus status);
}
