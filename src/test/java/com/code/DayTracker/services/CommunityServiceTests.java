package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.code.DayTracker.dto.CommunityCommentRequest;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.repositories.*;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

class CommunityServiceTests {
 private CommunityCommentRepository comments; private TrackedItemRepository tracks; private CommunityService service;
 @BeforeEach void setUp(){comments=mock(CommunityCommentRepository.class);tracks=mock(TrackedItemRepository.class);service=new CommunityService(comments,mock(CommentReactionRepository.class),mock(CommentReportRepository.class),tracks,mock(CatalogMediaRepository.class),mock(UserRepository.class));}
 @Test void hidesEveryFutureConversationSurfaceByDefault(){TrackedItem track=mock(TrackedItem.class);when(track.getCurrentChapter()).thenReturn(45);when(tracks.findByCatalogMediaIdAndUserUsername(7L,"reader")).thenReturn(Optional.of(track));var thread=service.thread(7L,46,"reader",false,false);assertThat(thread.locked()).isTrue();assertThat(thread.comments()).isEmpty();verifyNoInteractions(comments);}
 @Test void letsUserExplicitlyRevealFutureThreadWithoutGrantingWritePermission(){TrackedItem track=mock(TrackedItem.class);when(track.getCurrentChapter()).thenReturn(45);when(tracks.findByCatalogMediaIdAndUserUsername(7L,"reader")).thenReturn(Optional.of(track));when(comments.findAllByMediaIdAndUnitNumberOrderByCreatedAtAsc(7L,46)).thenReturn(java.util.List.of());assertThat(service.thread(7L,46,"reader",true,false).locked()).isFalse();assertThatThrownBy(()->service.create(7L,new CommunityCommentRequest(46,null,"spoiler",false),"reader")).isInstanceOf(AccessDeniedException.class);}
 @Test void visitorWithoutProgressGetsLockedThread(){when(tracks.findByCatalogMediaIdAndUserUsername(7L,"visitor")).thenReturn(Optional.empty());var thread=service.thread(7L,1,"visitor",false,false);assertThat(thread.locked()).isTrue();assertThat(thread.lockReason()).contains("Registra");}
}
