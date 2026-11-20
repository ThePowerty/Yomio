package com.code.DayTracker.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.code.DayTracker.models.AppUser;
import com.code.DayTracker.models.MediaType;
import com.code.DayTracker.models.ReadingStatus;
import com.code.DayTracker.models.Role;
import com.code.DayTracker.models.TrackedItem;
import com.code.DayTracker.exceptions.ConflictException;
import com.code.DayTracker.repositories.ContactMessageRepository;
import com.code.DayTracker.repositories.TrackedItemRepository;
import com.code.DayTracker.repositories.UserRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

class AdminDashboardServiceTests {

    private UserRepository users;
    private ContactMessageRepository messages;
    private TrackedItemRepository trackedItems;
    private AdminDashboardService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        messages = mock(ContactMessageRepository.class);
        trackedItems = mock(TrackedItemRepository.class);
        service = new AdminDashboardService(users, messages, trackedItems);
    }

    @Test
    void overviewUsesRealUserAndMessageCounts() {
        when(users.count()).thenReturn(12L);
        when(users.countByRole(Role.ADMIN)).thenReturn(2L);
        when(messages.count()).thenReturn(7L);
        when(messages.countByResolvedAtIsNull()).thenReturn(3L);

        var result = service.overview();

        assertThat(result.totalUsers()).isEqualTo(12);
        assertThat(result.regularUsers()).isEqualTo(10);
        assertThat(result.adminUsers()).isEqualTo(2);
        assertThat(result.totalMessages()).isEqualTo(7);
        assertThat(result.unresolvedMessages()).isEqualTo(3);
    }

    @Test
    void userDirectoryIsTrimmedAndPaginatedOnTheServer() {
        PageRequest pageRequest = PageRequest.of(1, 10);
        AppUser user = new AppUser("reader", "reader@example.test", "hash", Role.USER);
        when(users.searchForAdmin("reader", pageRequest))
                .thenReturn(new PageImpl<>(List.of(user), pageRequest, 11));

        var result = service.users("  reader  ", 1, 10);

        assertThat(result.items()).singleElement().satisfies(item -> {
            assertThat(item.username()).isEqualTo("reader");
            assertThat(item.email()).isEqualTo("reader@example.test");
            assertThat(item.role()).isEqualTo(Role.USER);
        });
        assertThat(result.totalItems()).isEqualTo(11);
        verify(users).searchForAdmin("reader", pageRequest);
    }

    @Test
    void userDirectoryWithoutQueryUsesTheParameterlessListing() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(users.findAllForAdmin(pageRequest))
                .thenReturn(new PageImpl<>(List.of(), pageRequest, 0));

        var result = service.users("   ", 0, 10);

        assertThat(result.items()).isEmpty();
        assertThat(result.totalItems()).isZero();
        verify(users).findAllForAdmin(pageRequest);
    }

    @Test
    void progressReturnsOnlyAggregatedReadingAndViewingTotals() {
        AppUser user = user(7L, "reader", Role.USER);
        var anime = tracked("Anime", MediaType.ANIME, 8, 12, ReadingStatus.READING, user);
        var manga = tracked("Manga", MediaType.MANGA, 20, 20, ReadingStatus.COMPLETED, user);
        var openManhwa = tracked("Open", MediaType.MANHWA, 6, null, ReadingStatus.UP_TO_DATE, user);
        when(users.existsById(7L)).thenReturn(true);
        when(trackedItems.findAllByUserIdAndReadingStatusNot(7L, ReadingStatus.PLAN_TO_READ))
                .thenReturn(List.of(anime, manga, openManhwa));

        var result = service.progress(7L);

        assertThat(result.totalTracked()).isEqualTo(3);
        assertThat(result.activeTitles()).isEqualTo(2);
        assertThat(result.completedTitles()).isEqualTo(1);
        assertThat(result.viewing().trackedTitles()).isEqualTo(1);
        assertThat(result.viewing().currentUnits()).isEqualTo(8);
        assertThat(result.viewing().knownTotalUnits()).isEqualTo(12);
        assertThat(result.reading().trackedTitles()).isEqualTo(2);
        assertThat(result.reading().currentUnits()).isEqualTo(26);
        assertThat(result.reading().knownCurrentUnits()).isEqualTo(20);
        assertThat(result.reading().knownTotalUnits()).isEqualTo(20);
    }

    @Test
    void roleUpdatePersistsTheSelectedRole() {
        AppUser administrator = user(1L, "administrator", Role.ADMIN);
        AppUser reader = user(2L, "reader", Role.USER);
        when(users.findAllForRoleUpdate()).thenReturn(List.of(administrator, reader));

        var result = service.updateRole(2L, Role.ADMIN, "administrator");

        assertThat(result.role()).isEqualTo(Role.ADMIN);
        assertThat(reader.getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void administratorCannotChangeTheirOwnRole() {
        AppUser administrator = user(1L, "administrator", Role.ADMIN);
        when(users.findAllForRoleUpdate()).thenReturn(List.of(administrator));

        assertThatThrownBy(() -> service.updateRole(1L, Role.USER, "administrator"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("You cannot change your own role");
    }

    @Test
    void lastAdministratorCannotBeDemoted() {
        AppUser lastAdministrator = user(1L, "owner", Role.ADMIN);
        AppUser actingAdministrator = user(2L, "administrator", Role.USER);
        when(users.findAllForRoleUpdate()).thenReturn(List.of(lastAdministrator, actingAdministrator));

        assertThatThrownBy(() -> service.updateRole(1L, Role.USER, "administrator"))
                .isInstanceOf(ConflictException.class)
                .hasMessage("The last administrator cannot be demoted");
    }

    private AppUser user(Long id, String username, Role role) {
        AppUser user = new AppUser(username, username + "@example.test", "hash", role);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private TrackedItem tracked(String title, MediaType type, Integer current, Integer total,
                                ReadingStatus status, AppUser user) {
        return new TrackedItem(title, type, current, total, status, null,
                status == ReadingStatus.COMPLETED, null, user);
    }
}
