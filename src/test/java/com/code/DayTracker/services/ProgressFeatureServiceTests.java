package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;
import com.code.DayTracker.dto.ProgressNoteRequest;
import com.code.DayTracker.dto.ChapterRatingRequest;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.repositories.*;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class ProgressFeatureServiceTests {
    private ProgressNoteRepository notes; private ChapterRatingRepository ratings; private TrackedItemRepository tracks;
    private ProgressFeatureService service;
    @BeforeEach void setUp(){notes=mock(ProgressNoteRepository.class);ratings=mock(ChapterRatingRepository.class);tracks=mock(TrackedItemRepository.class);service=new ProgressFeatureService(notes,ratings,tracks,mock(CatalogMediaRepository.class),mock(UserRepository.class));}
    @Test void blocksPrivateNoteBeyondOwnedProgress(){TrackedItem track=mock(TrackedItem.class);when(track.getCurrentChapter()).thenReturn(45);when(tracks.findByCatalogMediaIdAndUserUsername(9L,"reader")).thenReturn(Optional.of(track));assertThatThrownBy(()->service.createNote(9L,new ProgressNoteRequest(46,null,"Future"),"reader")).isInstanceOf(AccessDeniedException.class);verifyNoInteractions(notes);}
    @Test void privateNoteListAlwaysUsesAuthenticatedOwner(){TrackedItem track=mock(TrackedItem.class);when(track.getCurrentChapter()).thenReturn(45);when(tracks.findByCatalogMediaIdAndUserUsername(9L,"reader")).thenReturn(Optional.of(track));service.notes(9L,"reader",false);verify(notes).findAllByUserUsernameAndMediaIdAndUnitNumberLessThanEqualOrderByUnitNumberDescUpdatedAtDesc("reader",9L,45);}
    @Test void blocksChapterRatingBeyondOwnedProgress(){TrackedItem track=mock(TrackedItem.class);when(track.getCurrentChapter()).thenReturn(45);when(tracks.findByCatalogMediaIdAndUserUsername(9L,"reader")).thenReturn(Optional.of(track));assertThatThrownBy(()->service.rate(9L,new ChapterRatingRequest(46,8),"reader")).isInstanceOf(AccessDeniedException.class);verifyNoInteractions(ratings);}
}
