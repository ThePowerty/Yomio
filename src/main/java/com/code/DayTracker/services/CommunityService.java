package com.code.DayTracker.services;

import com.code.DayTracker.dto.*;
import com.code.DayTracker.models.*;
import com.code.DayTracker.repositories.*;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommunityService {
    private final CommunityCommentRepository comments; private final CommentReactionRepository reactions; private final CommentReportRepository reports;
    private final TrackedItemRepository tracks; private final CatalogMediaRepository media; private final UserRepository users;
    public CommunityService(CommunityCommentRepository comments,CommentReactionRepository reactions,CommentReportRepository reports,TrackedItemRepository tracks,CatalogMediaRepository media,UserRepository users){this.comments=comments;this.reactions=reactions;this.reports=reports;this.tracks=tracks;this.media=media;this.users=users;}

    @Transactional(readOnly=true)
    public CommunityThreadResponse thread(Long mediaId,int unit,String username,boolean revealFuture,boolean revealSpoilers){
        int progress=progress(mediaId,username);
        if(unit>progress && !revealFuture){return new CommunityThreadResponse(mediaId,unit,progress,true,progress==0?"Registra tu progreso para desbloquear la conversación.":"Este punto supera tu progreso y puede contener spoilers.",List.of());}
        List<CommunityCommentResponse> values=comments.findAllByMediaIdAndUnitNumberOrderByCreatedAtAsc(mediaId,unit).stream().map(c->toResponse(c,username,revealSpoilers)).toList();
        return new CommunityThreadResponse(mediaId,unit,progress,false,null,values);
    }

    @Transactional
    public CommunityCommentResponse create(Long mediaId,CommunityCommentRequest request,String username){
        if(request.unitNumber()>progress(mediaId,username)) throw new AccessDeniedException("Complete this chapter or episode before commenting");
        CatalogMedia catalogMedia=media.findById(mediaId).orElseThrow(()->new IllegalArgumentException("Catalog title not found"));
        CommunityComment parent=null;
        if(request.parentId()!=null){parent=comments.findById(request.parentId()).orElseThrow(()->new IllegalArgumentException("Parent comment not found")); if(!parent.getMedia().getId().equals(mediaId)||!parent.getUnitNumber().equals(request.unitNumber())) throw new IllegalArgumentException("Reply must belong to the same conversation");}
        CommunityComment saved=comments.save(new CommunityComment(user(username),catalogMedia,request.unitNumber(),parent,request.body().trim(),request.spoiler()));
        return toResponse(saved,username,!request.spoiler());
    }

    @Transactional
    public boolean toggleReaction(Long commentId,String username){
        CommunityComment comment=comments.findById(commentId).orElseThrow(()->new IllegalArgumentException("Comment not found"));
        if(comment.getUnitNumber()>progress(comment.getMedia().getId(),username)) throw new AccessDeniedException("Reaction blocked by spoiler protection");
        var existing=reactions.findByUserUsernameAndCommentId(username,commentId);
        if(existing.isPresent()){reactions.delete(existing.get());return false;}
        reactions.save(new CommentReaction(user(username),comment));return true;
    }

    @Transactional
    public void report(Long commentId,String reason,String username){
        if(reason==null||reason.isBlank()||reason.length()>500) throw new IllegalArgumentException("Report reason is required and must be under 500 characters");
        CommunityComment comment=comments.findById(commentId).orElseThrow(()->new IllegalArgumentException("Comment not found"));
        if(!reports.existsByUserUsernameAndCommentId(username,commentId)) reports.save(new CommentReport(user(username),comment,reason.trim()));
    }

    private CommunityCommentResponse toResponse(CommunityComment c,String username,boolean revealSpoilers){boolean hidden=c.isSpoiler()&&!revealSpoilers;return new CommunityCommentResponse(c.getId(),c.getParent()==null?null:c.getParent().getId(),c.getUnitNumber(),c.getUser().getUsername(),hidden?null:c.getBody(),hidden,c.isSpoiler(),reactions.countByCommentId(c.getId()),reactions.findByUserUsernameAndCommentId(username,c.getId()).isPresent(),c.getCreatedAt());}
    private int progress(Long mediaId,String username){return tracks.findByCatalogMediaIdAndUserUsername(mediaId,username).map(TrackedItem::getCurrentChapter).orElse(0);}
    private AppUser user(String username){return users.findByUsername(username).orElseThrow(()->new IllegalArgumentException("User not found"));}
}
