package com.code.DayTracker.repositories;
import com.code.DayTracker.models.ChapterRating;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface ChapterRatingRepository extends JpaRepository<ChapterRating,Long>{
 List<ChapterRating> findAllByUserUsernameAndMediaIdAndUnitNumberLessThanEqualOrderByUnitNumberDesc(String username,Long mediaId,Integer maxUnit);
 Optional<ChapterRating> findByUserUsernameAndMediaIdAndUnitNumber(String username,Long mediaId,Integer unit);
 Optional<ChapterRating> findByIdAndUserUsername(Long id,String username);
 @Query("select r.unitNumber, avg(r.rating), count(r) from ChapterRating r where r.media.id=:mediaId and r.unitNumber<=:maxUnit group by r.unitNumber order by r.unitNumber")
 List<Object[]> trends(@Param("mediaId") Long mediaId,@Param("maxUnit") Integer maxUnit);
}
