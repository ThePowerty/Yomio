package com.code.DayTracker.repositories;

import com.code.DayTracker.models.ContactMessage;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    @Query("""
            select message from ContactMessage message
            order by case when message.resolvedAt is null then 0 else 1 end, message.createdAt desc
            """)
    List<ContactMessage> findAllForAdmin(Pageable pageable);
}
