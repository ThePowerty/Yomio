package com.code.DayTracker.services;
import com.code.DayTracker.dto.*;
import com.code.DayTracker.models.*;
import com.code.DayTracker.repositories.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationService {
 private final CatalogMediaRepository catalog; private final TrackedItemRepository tracks; private final RecommendationDismissalRepository dismissals; private final RecommendationPreferenceRepository preferences; private final UserRepository users;
 private final Map<String,List<RecommendationResponse>> cache=new ConcurrentHashMap<>();
 public RecommendationService(CatalogMediaRepository catalog,TrackedItemRepository tracks,RecommendationDismissalRepository dismissals,RecommendationPreferenceRepository preferences,UserRepository users){this.catalog=catalog;this.tracks=tracks;this.dismissals=dismissals;this.preferences=preferences;this.users=users;}
 @Transactional(readOnly=true)
 public List<RecommendationResponse> recommend(String username,MediaType type,String genre,String status,Integer maxLength,boolean includeFinished){
  List<TrackedItem> history=tracks.findAllByUserUsernameOrderByUpdatedAtDesc(username);
  Set<Long> excluded=new HashSet<>(dismissals.findAllByUserUsername(username).stream().map(d->d.getMedia().getId()).toList());
  history.stream().filter(t->!includeFinished || (t.getReadingStatus()!=ReadingStatus.COMPLETED&&t.getReadingStatus()!=ReadingStatus.DROPPED)).map(TrackedItem::getCatalogMedia).filter(Objects::nonNull).map(CatalogMedia::getId).forEach(excluded::add);
  String signature=username+"|"+type+"|"+genre+"|"+status+"|"+maxLength+"|"+includeFinished+"|"+history.stream().map(TrackedItem::getUpdatedAt).max(Comparator.naturalOrder()).orElse(null)+"|"+excluded.hashCode();
  RecommendationPreference preference=preferences.findByUserUsername(username).orElse(null);
  return cache.computeIfAbsent(signature+"|"+(preference==null?"":preference.getGenres()+preference.getFormats()),key->calculate(history,excluded,type,genre,status,maxLength,preference));
 }
 private List<RecommendationResponse> calculate(List<TrackedItem> history,Set<Long> excluded,MediaType type,String genre,String status,Integer maxLength,RecommendationPreference preference){
  Map<String,Integer> tastes=new HashMap<>();
  history.stream().filter(t->t.getCatalogMedia()!=null&&(t.isFavorite()||(t.getScore()!=null&&t.getScore()>=7))).forEach(t->split(t.getCatalogMedia().getGenres()).forEach(g->tastes.merge(g,1,Integer::sum)));
  if(tastes.isEmpty()&&preference!=null)split(preference.getGenres()).forEach(g->tastes.put(g,1));
  Set<String> preferredFormats=preference==null?Set.of():new HashSet<>(split(preference.getFormats()));
  return catalog.findAll().stream().filter(m->!excluded.contains(m.getId())).filter(m->type==null?m.getType()!=MediaType.MOVIE:m.getType()==type).filter(m->preferredFormats.isEmpty()||preferredFormats.contains(m.getType().name())).filter(m->genre==null||genre.isBlank()||split(m.getGenres()).stream().anyMatch(g->g.equalsIgnoreCase(genre))).filter(m->status==null||status.isBlank()||status.equalsIgnoreCase(m.getStatus())).filter(m->maxLength==null||length(m)==null||length(m)<=maxLength).map(m->{List<String> overlap=split(m.getGenres()).stream().filter(tastes::containsKey).sorted(Comparator.comparingInt((String g)->tastes.get(g)).reversed()).toList();int score=overlap.stream().mapToInt(tastes::get).sum()*10+(m.getAverageScore()==null?0:m.getAverageScore()/10);String explanation=overlap.isEmpty()?"Selección popular para descubrir nuevos gustos.":history.isEmpty()?"Coincide con tus gustos iniciales: "+String.join(", ",overlap.stream().limit(2).toList())+".":"Porque valoraste o marcaste como favoritas obras de "+String.join(", ",overlap.stream().limit(2).toList())+".";return new RecommendationResponse(CatalogMediaResponse.from(m),explanation,score);}).sorted(Comparator.comparingInt(RecommendationResponse::matchScore).reversed()).limit(100).toList();
 }
 @Transactional public void dismiss(String username,Long mediaId){if(!dismissals.existsByUserUsernameAndMediaId(username,mediaId))dismissals.save(new RecommendationDismissal(users.findByUsername(username).orElseThrow(),catalog.findById(mediaId).orElseThrow()));cache.keySet().removeIf(k->k.startsWith(username+"|"));}
 @Transactional(readOnly=true) public RecommendationPreferenceResponse preference(String username){RecommendationPreference p=preferences.findByUserUsername(username).orElse(null);return p==null?new RecommendationPreferenceResponse(List.of(),List.of()):new RecommendationPreferenceResponse(split(p.getGenres()),split(p.getFormats()).stream().map(MediaType::valueOf).toList());}
 @Transactional public RecommendationPreferenceResponse savePreference(String username,RecommendationPreferenceRequest request){RecommendationPreference p=preferences.findByUserUsername(username).orElseGet(()->new RecommendationPreference(users.findByUsername(username).orElseThrow()));String genres=join(request.genres());String formats=request.formats()==null?null:request.formats().stream().filter(t->t!=MediaType.MOVIE).map(Enum::name).distinct().collect(java.util.stream.Collectors.joining("|"));p.update(genres,formats);preferences.save(p);cache.keySet().removeIf(k->k.startsWith(username+"|"));return preference(username);}
 private List<String> split(String values){return values==null||values.isBlank()?List.of():List.of(values.split("\\|"));}
 private String join(List<String> values){return values==null?null:values.stream().filter(Objects::nonNull).map(String::trim).filter(v->!v.isBlank()).distinct().collect(java.util.stream.Collectors.joining("|"));}
 private Integer length(CatalogMedia m){return m.getType()==MediaType.ANIME||m.getType()==MediaType.MOVIE?m.getEpisodes():m.getChapters();}
}
