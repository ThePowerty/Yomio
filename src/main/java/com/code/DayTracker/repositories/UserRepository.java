package com.code.DayTracker.repositories;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.Role;
import java.util.Optional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface UserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameAndIdNot(String username, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByRole(Role role);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from AppUser account order by account.id")
    List<AppUser> findAllForRoleUpdate();

    @Query("""
            select account from AppUser account
            order by lower(account.username), account.id
            """)
    Page<AppUser> findAllForAdmin(Pageable pageable);

    @Query("""
            select account from AppUser account
            where (lower(account.username) like lower(concat('%', :query, '%'))
                or lower(account.email) like lower(concat('%', :query, '%')))
            order by lower(account.username), account.id
            """)
    Page<AppUser> searchForAdmin(@Param("query") String query, Pageable pageable);
}
