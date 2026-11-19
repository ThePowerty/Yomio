package com.code.DayTracker.repositories;
import com.code.DayTracker.models.ProgressNote;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProgressNoteRepository extends JpaRepository<ProgressNote,Long>{
 List<ProgressNote> findAllByUserUsernameAndMediaIdAndUnitNumberLessThanEqualOrderByUnitNumberDescUpdatedAtDesc(String username,Long mediaId,Integer maxUnit);
 List<ProgressNote> findAllByUserUsernameAndMediaIdOrderByUnitNumberDescUpdatedAtDesc(String username,Long mediaId);
 Optional<ProgressNote> findByIdAndUserUsername(Long id,String username);
}
