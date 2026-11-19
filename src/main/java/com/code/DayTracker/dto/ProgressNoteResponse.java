package com.code.DayTracker.dto;
import com.code.DayTracker.models.ProgressNote;
import java.time.Instant;
public record ProgressNoteResponse(Long id,Long mediaId,Integer unitNumber,Integer volumeNumber,String content,Instant createdAt,Instant updatedAt){
 public static ProgressNoteResponse from(ProgressNote n){return new ProgressNoteResponse(n.getId(),n.getMedia().getId(),n.getUnitNumber(),n.getVolumeNumber(),n.getContent(),n.getCreatedAt(),n.getUpdatedAt());}
}
