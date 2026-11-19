package com.code.DayTracker.controllers;
import com.code.DayTracker.dto.*;
import com.code.DayTracker.services.ProgressFeatureService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/media/{mediaId}")
public class ProgressFeatureController {
 private final ProgressFeatureService service; public ProgressFeatureController(ProgressFeatureService service){this.service=service;}
 @GetMapping("/notes") public List<ProgressNoteResponse> notes(@PathVariable Long mediaId,@RequestParam(defaultValue="false") boolean includeFuture,Authentication auth){return service.notes(mediaId,auth.getName(),includeFuture);}
 @PostMapping("/notes") @ResponseStatus(HttpStatus.CREATED) public ProgressNoteResponse createNote(@PathVariable Long mediaId,@Valid @RequestBody ProgressNoteRequest request,Authentication auth){return service.createNote(mediaId,request,auth.getName());}
 @PutMapping("/notes/{id}") public ProgressNoteResponse updateNote(@PathVariable Long mediaId,@PathVariable Long id,@Valid @RequestBody ProgressNoteRequest request,Authentication auth){return service.updateNote(id,request,auth.getName());}
 @DeleteMapping("/notes/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteNote(@PathVariable Long mediaId,@PathVariable Long id,Authentication auth){service.deleteNote(id,auth.getName());}
 @GetMapping("/ratings") public List<ChapterRatingResponse> ratings(@PathVariable Long mediaId,Authentication auth){return service.ratings(mediaId,auth.getName());}
 @GetMapping("/rating-trends") public List<ChapterRatingTrendResponse> trends(@PathVariable Long mediaId,@RequestParam(defaultValue="false") boolean revealFuture,Authentication auth){return service.ratingTrends(mediaId,auth.getName(),revealFuture);}
 @PutMapping("/ratings") public ChapterRatingResponse rate(@PathVariable Long mediaId,@Valid @RequestBody ChapterRatingRequest request,Authentication auth){return service.rate(mediaId,request,auth.getName());}
 @DeleteMapping("/ratings/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteRating(@PathVariable Long mediaId,@PathVariable Long id,Authentication auth){service.deleteRating(id,auth.getName());}
}
