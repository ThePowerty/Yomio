package com.code.DayTracker.controllers;
import com.code.DayTracker.dto.*;
import com.code.DayTracker.services.CommunityService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/community")
public class CommunityController {
 private final CommunityService service; public CommunityController(CommunityService service){this.service=service;}
 @GetMapping("/{mediaId}") public CommunityThreadResponse thread(@PathVariable Long mediaId,@RequestParam int unit,@RequestParam(defaultValue="false") boolean revealFuture,@RequestParam(defaultValue="false") boolean revealSpoilers,Authentication auth){return service.thread(mediaId,unit,auth.getName(),revealFuture,revealSpoilers);}
 @PostMapping("/{mediaId}") @ResponseStatus(HttpStatus.CREATED) public CommunityCommentResponse create(@PathVariable Long mediaId,@Valid @RequestBody CommunityCommentRequest request,Authentication auth){return service.create(mediaId,request,auth.getName());}
 @PostMapping("/comments/{id}/reaction") public Map<String,Boolean> react(@PathVariable Long id,Authentication auth){return Map.of("reacted",service.toggleReaction(id,auth.getName()));}
 @PostMapping("/comments/{id}/reports") @ResponseStatus(HttpStatus.NO_CONTENT) public void report(@PathVariable Long id,@RequestBody Map<String,String> payload,Authentication auth){service.report(id,payload.get("reason"),auth.getName());}
}
