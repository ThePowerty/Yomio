package com.code.DayTracker.models;
import jakarta.persistence.*;
@Entity @Table(name="recommendation_dismissals",uniqueConstraints=@UniqueConstraint(columnNames={"user_id","catalog_media_id"}))
public class RecommendationDismissal {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private AppUser user;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="catalog_media_id") private CatalogMedia media;
 protected RecommendationDismissal(){} public RecommendationDismissal(AppUser user,CatalogMedia media){this.user=user;this.media=media;}
 public CatalogMedia getMedia(){return media;}
}
