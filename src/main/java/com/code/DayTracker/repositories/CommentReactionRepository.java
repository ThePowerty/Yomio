package com.code.DayTracker.repositories;
import com.code.DayTracker.models.CommentReaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CommentReactionRepository extends JpaRepository<CommentReaction,Long>{
 Optional<CommentReaction> findByUserUsernameAndCommentId(String username,Long commentId);
 long countByCommentId(Long commentId);
}
