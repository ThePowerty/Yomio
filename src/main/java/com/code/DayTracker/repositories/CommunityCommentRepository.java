package com.code.DayTracker.repositories;
import com.code.DayTracker.models.CommunityComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CommunityCommentRepository extends JpaRepository<CommunityComment,Long>{
 List<CommunityComment> findAllByMediaIdAndUnitNumberOrderByCreatedAtAsc(Long mediaId,Integer unitNumber);
}
