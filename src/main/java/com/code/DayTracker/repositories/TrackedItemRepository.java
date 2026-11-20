package com.code.DayTracker.repositories;

import com.code.DayTracker.models.TrackedItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackedItemRepository extends JpaRepository<TrackedItem, Long> {

    List<TrackedItem> findAllByUserUsernameOrderByUpdatedAtDesc(String username);

    List<TrackedItem> findAllByUserUsernameAndReadingStatusNotOrderByUpdatedAtDesc(String username, com.code.DayTracker.models.ReadingStatus readingStatus);

    Optional<TrackedItem> findByIdAndUserUsername(Long id, String username);

    Optional<TrackedItem> findByCatalogMediaIdAndUserUsername(Long catalogMediaId, String username);

    List<TrackedItem> findAllByUserUsernameAndReadingStatusOrderByUpdatedAtDesc(String username, com.code.DayTracker.models.ReadingStatus readingStatus);

    List<TrackedItem> findAllByUserIdAndReadingStatusNot(Long userId, com.code.DayTracker.models.ReadingStatus readingStatus);
}
