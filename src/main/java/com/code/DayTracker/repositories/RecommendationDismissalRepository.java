package com.code.DayTracker.repositories;
import com.code.DayTracker.models.RecommendationDismissal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RecommendationDismissalRepository extends JpaRepository<RecommendationDismissal,Long>{
 List<RecommendationDismissal> findAllByUserUsername(String username);
 boolean existsByUserUsernameAndMediaId(String username,Long mediaId);
}
