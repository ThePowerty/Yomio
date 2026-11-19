package com.code.DayTracker.models;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "community_comments")
public class CommunityComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private AppUser user;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "catalog_media_id") private CatalogMedia media;
    @Column(nullable = false) private Integer unitNumber;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_id") @OnDelete(action = OnDeleteAction.SET_NULL) private CommunityComment parent;
    @Column(nullable = false, length = 2000) private String body;
    @Column(nullable = false) private boolean spoiler;
    @Column(nullable = false) private boolean deleted;
    @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
    @Column(nullable = false) private Instant updatedAt = Instant.now();
    protected CommunityComment() {}
    public CommunityComment(AppUser user, CatalogMedia media, int unitNumber, CommunityComment parent, String body, boolean spoiler) { this.user=user; this.media=media; this.unitNumber=unitNumber; this.parent=parent; this.body=body; this.spoiler=spoiler; }
    public Long getId(){return id;} public AppUser getUser(){return user;} public CatalogMedia getMedia(){return media;} public Integer getUnitNumber(){return unitNumber;}
    public CommunityComment getParent(){return parent;} public String getBody(){return body;} public boolean isSpoiler(){return spoiler;} public boolean isDeleted(){return deleted;} public Instant getCreatedAt(){return createdAt;}
}
