package com.code.DayTracker.dto;
import java.time.Instant;
public record CommunityCommentResponse(Long id,Long parentId,Integer unitNumber,String author,String body,boolean contentHidden,boolean manualSpoiler,long reactions,boolean reactedByMe,Instant createdAt){}
