import { CalendarClock, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Notice } from "../../components/Notice/Notice";
import { LoadingSkeleton } from "../../components/LoadingSkeleton/LoadingSkeleton";
import { useTracker } from "../../context/TrackerContext";
import "./ReleaseCalendarPage.css";

const GRID_DAYS = 42;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCalendarDays(month) {
  const first = startOfMonth(month);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - mondayOffset);
  return Array.from({ length: GRID_DAYS }, (_, index) => (
    new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
  ));
}

function isSameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function getLocale(language) {
  return language?.startsWith("en") ? "en-US" : "es-ES";
}

export function ReleaseCalendarPage({ compact = false }) {
  const { t, i18n } = useTranslation();
  const { items, initialLoading, status, clearStatus } = useTracker();
  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const locale = getLocale(i18n.resolvedLanguage);

  const events = useMemo(() => items
    .filter((item) => item.catalogStatus === "RELEASING"
      && item.nextReleaseAt
      && item.readingStatus !== "COMPLETED"
      && item.readingStatus !== "DROPPED")
    .map((item) => ({ ...item, releaseDate: new Date(item.nextReleaseAt) }))
    .filter((item) => !Number.isNaN(item.releaseDate.getTime()) && item.releaseDate >= today)
    .sort((left, right) => left.releaseDate - right.releaseDate), [items, today]);

  const eventsByDate = useMemo(() => events.reduce((calendar, event) => {
    const key = toDateKey(event.releaseDate);
    const dayEvents = calendar.get(key) || [];
    dayEvents.push(event);
    calendar.set(key, dayEvents);
    return calendar;
  }, new Map()), [events]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const selectedEvents = eventsByDate.get(selectedDateKey) || [];
  const selectedDate = useMemo(() => {
    const [year, month, day] = selectedDateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDateKey]);
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(visibleMonth);
  const selectedDayLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long", day: "numeric", month: "long"
  }).format(selectedDate);
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const monday = new Date(2026, 0, 5 + index);
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(monday);
  }), [locale]);

  function changeMonth(amount) {
    const nextMonth = addMonths(visibleMonth, amount);
    setVisibleMonth(nextMonth);
    setSelectedDateKey(toDateKey(nextMonth));
  }

  function selectToday() {
    setVisibleMonth(startOfMonth(today));
    setSelectedDateKey(toDateKey(today));
  }

  function selectDay(date) {
    setSelectedDateKey(toDateKey(date));
    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(startOfMonth(date));
    }
  }

  function releaseLabel(event) {
    const number = event.latestReleasedUnit == null ? null : event.latestReleasedUnit + 1;
    const isEpisode = event.type === "ANIME" || event.type === "MOVIE";
    if (number == null) return t(isEpisode ? "calendar.newEpisode" : "calendar.newChapter");
    return t(isEpisode ? "calendar.episode" : "calendar.chapter", { number });
  }

  return (
    <section className={`release-calendar-page page-stack${compact ? " compact" : ""}`}>
      <header className="release-calendar-intro">
        <div>
          <span className="eyebrow">{t("calendar.eyebrow")}</span>
          <p>{t("calendar.description")}</p>
        </div>
        <span className="release-timezone"><Clock3 size={16} /> {t("calendar.localTime")}</span>
      </header>

      <Notice message={status} onClose={clearStatus} />

      <div className="release-calendar-layout">
        <section className="release-calendar-panel" aria-label={t("calendar.calendarLabel")}>
          <div className="release-calendar-toolbar">
            <button type="button" className="ghost release-today" onClick={selectToday}>{t("calendar.today")}</button>
            <h3 aria-live="polite">{monthLabel}</h3>
            <div className="release-month-actions">
              <button type="button" className="icon-button" onClick={() => changeMonth(-1)} aria-label={t("calendar.previousMonth")}>
                <ChevronLeft size={19} />
              </button>
              <button type="button" className="icon-button" onClick={() => changeMonth(1)} aria-label={t("calendar.nextMonth")}>
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="release-weekdays" aria-hidden="true">
            {weekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>

          {initialLoading && items.length === 0 ? (
            <LoadingSkeleton variant="calendar" compact={compact} label={t("common.loading")} />
          ) : (
            <div className="release-month-grid">
              {calendarDays.map((date) => {
                const dateKey = toDateKey(date);
                const dayEvents = eventsByDate.get(dateKey) || [];
                const isToday = dateKey === toDateKey(today);
                const isSelected = dateKey === selectedDateKey;
                const dateLabel = new Intl.DateTimeFormat(locale, {
                  weekday: "long", day: "numeric", month: "long", year: "numeric"
                }).format(date);
                return (
                  <button
                    type="button"
                    key={dateKey}
                    className={`release-day${isSameMonth(date, visibleMonth) ? "" : " outside"}${isSelected ? " selected" : ""}${dayEvents.length ? " has-events" : ""}`}
                    onClick={() => selectDay(date)}
                    aria-label={`${dateLabel}. ${t("calendar.releaseCount", { count: dayEvents.length })}`}
                    aria-pressed={isSelected}
                    aria-describedby={dayEvents.length ? `release-tooltip-${dateKey}` : undefined}
                    aria-current={isToday ? "date" : undefined}
                  >
                    <span className="release-day-number">{date.getDate()}</span>
                    <span className="release-day-events" aria-hidden="true">
                      {dayEvents.slice(0, 2).map((event) => (
                        <span key={event.id} className={`release-marker type-${event.type.toLowerCase()}`}>
                          <span className="release-label">{event.title}</span>
                        </span>
                      ))}
                      {dayEvents.length > 2 && <span className="release-more">{t("calendar.more", { count: dayEvents.length - 2 })}</span>}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="release-tooltip" role="tooltip" id={`release-tooltip-${dateKey}`}>
                        <strong>{dateLabel}</strong>
                        {dayEvents.map((event) => (
                          <span key={event.id}><b>{event.title}</b><span>{releaseLabel(event)} · {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(event.releaseDate)}</span></span>
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <aside className="release-agenda" aria-label={t("calendar.agendaLabel")}>
          <div className="release-agenda-heading">
            <span className="eyebrow">{t("calendar.releaseCount", { count: selectedEvents.length })}</span>
            <h3>{t("calendar.selectedDay", { date: selectedDayLabel })}</h3>
          </div>

          {selectedEvents.length > 0 ? (
            <div className="release-agenda-list">
              {selectedEvents.map((event) => (
                <Link key={event.id} className="release-agenda-item" to={`/catalog/${event.type.toLowerCase()}/${event.catalogMediaId}`} aria-label={t("calendar.openTitle", { title: event.title })}>
                  <span className={`release-type-mark type-${event.type.toLowerCase()}`} aria-hidden="true" />
                  <span className="release-agenda-copy">
                    <strong>{event.title}</strong>
                    <span>{releaseLabel(event)}</span>
                  </span>
                  <time dateTime={event.nextReleaseAt}>
                    {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(event.releaseDate)}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="release-agenda-empty">
              <CalendarClock size={30} />
              <strong>{events.length === 0 ? t("calendar.emptyTitle") : t("calendar.noDayReleases")}</strong>
              {events.length === 0 && <p>{t("calendar.emptyDescription")}</p>}
              {events.length === 0 && <Link className="ghost" to="/tracking">{t("calendar.goToTracking")}</Link>}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
