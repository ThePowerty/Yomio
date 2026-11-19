package com.code.DayTracker.repositories;
import com.code.DayTracker.models.CommentReport;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CommentReportRepository extends JpaRepository<CommentReport,Long>{ boolean existsByUserUsernameAndCommentId(String username,Long commentId); }
