package com.code.DayTracker.models;
import jakarta.persistence.*;
@Entity @Table(name="comment_reports", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","comment_id"}))
public class CommentReport {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private AppUser user;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="comment_id") private CommunityComment comment;
 @Column(nullable=false,length=500) private String reason;
 protected CommentReport(){} public CommentReport(AppUser user, CommunityComment comment, String reason){this.user=user;this.comment=comment;this.reason=reason;}
}
