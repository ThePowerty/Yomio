package com.code.DayTracker.controllers;
import com.code.DayTracker.dto.RecommendationResponse;
import com.code.DayTracker.dto.RecommendationPreferenceRequest;
import com.code.DayTracker.dto.RecommendationPreferenceResponse;
import jakarta.validation.Valid;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.services.RecommendationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/recommendations")
public class RecommendationController{
 private final RecommendationService service;public RecommendationController(RecommendationService service){this.service=service;}
 @GetMapping public List<RecommendationResponse> list(@RequestParam(required=false) MediaType type,@RequestParam(required=false) String genre,@RequestParam(required=false) String status,@RequestParam(required=false) Integer maxLength,@RequestParam(defaultValue="false") boolean includeFinished,Authentication auth){return service.recommend(auth.getName(),type,genre,status,maxLength,includeFinished);}
 @PostMapping("/{mediaId}/dismiss") @ResponseStatus(HttpStatus.NO_CONTENT) public void dismiss(@PathVariable Long mediaId,Authentication auth){service.dismiss(auth.getName(),mediaId);}
 @GetMapping("/preferences") public RecommendationPreferenceResponse preferences(Authentication auth){return service.preference(auth.getName());}
 @PutMapping("/preferences") public RecommendationPreferenceResponse preferences(@Valid @RequestBody RecommendationPreferenceRequest request,Authentication auth){return service.savePreference(auth.getName(),request);}
}
