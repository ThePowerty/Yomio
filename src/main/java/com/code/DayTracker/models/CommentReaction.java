package com.code.DayTracker.models;
import jakarta.persistence.*;
@Entity @Table(name="comment_reactions", uniqueConstraints=@UniqueConstraint(columnNames={"user_id","comment_id"}))
public class CommentReaction {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private AppUser user;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="comment_id") private CommunityComment comment;
 protected CommentReaction(){} public CommentReaction(AppUser user, CommunityComment comment){this.user=user;this.comment=comment;}
}
