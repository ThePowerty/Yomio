package com.code.DayTracker.integrations.mangadex;
import java.util.List;
public record MangaDexFeedResponse(List<ChapterData> data){
 public record ChapterData(ChapterAttributes attributes){}
 public record ChapterAttributes(String chapter,String publishAt,String readableAt){}
}
