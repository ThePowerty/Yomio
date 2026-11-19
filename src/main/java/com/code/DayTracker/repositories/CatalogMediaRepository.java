package com.code.DayTracker.repositories;

import com.code.DayTracker.models.CatalogMedia;
import com.code.DayTracker.models.MediaType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CatalogMediaRepository extends JpaRepository<CatalogMedia, Long> {

    Optional<CatalogMedia> findByAnilistId(Integer anilistId);

    boolean existsByAnilistId(Integer anilistId);

    Optional<CatalogMedia> findFirstByTitleIgnoreCaseOrTitleEnglishIgnoreCase(String title, String titleEnglish);

    Page<CatalogMedia> findAllByOrderByPopularityDescAverageScoreDesc(Pageable pageable);

    Page<CatalogMedia> findByTypeOrderByPopularityDescAverageScoreDesc(MediaType type, Pageable pageable);

    List<CatalogMedia> findAllByStatusIgnoreCase(String status);

    @Query("""
            select media from CatalogMedia media
            where (:type is null or media.type = :type)
              and (:status is null or upper(media.status) = upper(:status))
              and (:query is null or
                lower(media.title) like lower(concat('%', :query, '%'))
                or lower(media.titleEnglish) like lower(concat('%', :query, '%'))
                or lower(media.titleNative) like lower(concat('%', :query, '%'))
                or lower(media.titleLocalized) like lower(concat('%', :query, '%'))
                or lower(media.aliases) like lower(concat('%', :query, '%'))
              )
            order by media.popularity desc, media.averageScore desc
            """)
    Page<CatalogMedia> search(
            @Param("query") String query,
            @Param("type") MediaType type,
            @Param("status") String status,
            Pageable pageable
    );
}
