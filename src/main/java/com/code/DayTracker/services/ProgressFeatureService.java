package com.code.DayTracker.services;

import com.code.DayTracker.dto.*;
import com.code.DayTracker.models.*;
import com.code.DayTracker.repositories.*;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProgressFeatureService {
    private final ProgressNoteRepository notes;
    private final ChapterRatingRepository ratings;
    private final TrackedItemRepository tracks;
    private final CatalogMediaRepository media;
    private final UserRepository users;

    public ProgressFeatureService(ProgressNoteRepository notes, ChapterRatingRepository ratings, TrackedItemRepository tracks, CatalogMediaRepository media, UserRepository users) {
        this.notes=notes; this.ratings=ratings; this.tracks=tracks; this.media=media; this.users=users;
    }

    @Transactional(readOnly=true)
    public List<ProgressNoteResponse> notes(Long mediaId, String username, boolean includeFuture) {
        int progress=progress(mediaId,username);
        var result=includeFuture
                ? notes.findAllByUserUsernameAndMediaIdOrderByUnitNumberDescUpdatedAtDesc(username,mediaId)
                : notes.findAllByUserUsernameAndMediaIdAndUnitNumberLessThanEqualOrderByUnitNumberDescUpdatedAtDesc(username,mediaId,progress);
        return result.stream().map(ProgressNoteResponse::from).toList();
    }

    @Transactional
    public ProgressNoteResponse createNote(Long mediaId, ProgressNoteRequest request, String username) {
        requireCompleted(mediaId,username,request.unitNumber());
        return ProgressNoteResponse.from(notes.save(new ProgressNote(user(username),media(mediaId),request.unitNumber(),request.volumeNumber(),request.content().trim())));
    }

    @Transactional
    public ProgressNoteResponse updateNote(Long id, ProgressNoteRequest request, String username) {
        ProgressNote note=notes.findByIdAndUserUsername(id,username).orElseThrow(() -> new AccessDeniedException("Private note not found"));
        requireCompleted(note.getMedia().getId(),username,request.unitNumber());
        note.update(request.unitNumber(),request.volumeNumber(),request.content().trim());
        return ProgressNoteResponse.from(note);
    }

    @Transactional public void deleteNote(Long id,String username){notes.delete(notes.findByIdAndUserUsername(id,username).orElseThrow(() -> new AccessDeniedException("Private note not found")));}

    @Transactional(readOnly=true)
    public List<ChapterRatingResponse> ratings(Long mediaId,String username){
        int progress=progress(mediaId,username);
        return ratings.findAllByUserUsernameAndMediaIdAndUnitNumberLessThanEqualOrderByUnitNumberDesc(username,mediaId,progress).stream().map(ChapterRatingResponse::from).toList();
    }

    @Transactional(readOnly=true)
    public List<ChapterRatingTrendResponse> ratingTrends(Long mediaId,String username,boolean revealFuture){
        int maxUnit=revealFuture?Integer.MAX_VALUE:progress(mediaId,username);
        return ratings.trends(mediaId,maxUnit).stream().map(row->new ChapterRatingTrendResponse((Integer)row[0],((Number)row[1]).doubleValue(),((Number)row[2]).longValue())).toList();
    }

    @Transactional
    public ChapterRatingResponse rate(Long mediaId,ChapterRatingRequest request,String username){
        requireCompleted(mediaId,username,request.unitNumber());
        ChapterRating rating=ratings.findByUserUsernameAndMediaIdAndUnitNumber(username,mediaId,request.unitNumber())
                .orElseGet(() -> new ChapterRating(user(username),media(mediaId),request.unitNumber(),request.rating()));
        rating.changeRating(request.rating());
        return ChapterRatingResponse.from(ratings.save(rating));
    }

    @Transactional public void deleteRating(Long id,String username){ratings.delete(ratings.findByIdAndUserUsername(id,username).orElseThrow(() -> new AccessDeniedException("Rating not found")));}

    private void requireCompleted(Long mediaId,String username,int unit){if(unit>progress(mediaId,username)) throw new AccessDeniedException("Complete this chapter or episode before using this feature");}
    private int progress(Long mediaId,String username){return tracks.findByCatalogMediaIdAndUserUsername(mediaId,username).map(TrackedItem::getCurrentChapter).orElse(0);}
    private CatalogMedia media(Long id){return media.findById(id).orElseThrow(() -> new IllegalArgumentException("Catalog title not found"));}
    private AppUser user(String username){return users.findByUsername(username).orElseThrow(() -> new IllegalArgumentException("User not found"));}
}
