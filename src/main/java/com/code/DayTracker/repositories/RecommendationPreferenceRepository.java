package com.code.DayTracker.repositories;
import com.code.DayTracker.models.RecommendationPreference;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RecommendationPreferenceRepository extends JpaRepository<RecommendationPreference,Long>{Optional<RecommendationPreference> findByUserUsername(String username);}
