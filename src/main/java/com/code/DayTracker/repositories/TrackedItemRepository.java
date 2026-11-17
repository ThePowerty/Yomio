package com.code.DayTracker.repositories;

import com.code.DayTracker.models.TrackedItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackedItemRepository extends JpaRepository<TrackedItem, Long> {

    List<TrackedItem> findAllByUserUsernameOrderByUpdatedAtDesc(String username);

    Optional<TrackedItem> findByIdAndUserUsername(Long id, String username);
}
