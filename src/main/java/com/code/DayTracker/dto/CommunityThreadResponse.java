package com.code.DayTracker.dto;
import java.util.List;
public record CommunityThreadResponse(Long mediaId,Integer unitNumber,Integer currentProgress,boolean locked,String lockReason,List<CommunityCommentResponse> comments){}
