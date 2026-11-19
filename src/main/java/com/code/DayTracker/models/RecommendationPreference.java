package com.code.DayTracker.models;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="recommendation_preferences")
public class RecommendationPreference{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",unique=true) private AppUser user;
 @Column(length=500) private String genres; @Column(length=100) private String formats; @Column(nullable=false) private Instant updatedAt=Instant.now();
 protected RecommendationPreference(){} public RecommendationPreference(AppUser user){this.user=user;}
 public void update(String genres,String formats){this.genres=genres;this.formats=formats;this.updatedAt=Instant.now();}
 public String getGenres(){return genres;} public String getFormats(){return formats;}
}
