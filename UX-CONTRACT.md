# UX Contract

## Product context

- Audience: people tracking anime, manga and manhwa over repeated sessions.
- Primary jobs: save exact progress, resume safely, remember context and discuss completed points.
- Active locales: Spanish and English; untranslated content falls back to Spanish only while migration is explicit.
- Accessibility target: WCAG 2.2 AA.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Ownership and permissions | `AGENTS.md`, Spring Security and owner-filtered repositories | Policy + implementation | 2026-11-17 |
| Progress/spoiler lifecycle | Current task and `/api/community`, `/api/media` contracts | Product brief + API | 2026-11-17 |
| Data lifecycle | Flyway migrations in `src/main/resources/db/migration` | Schema contract | 2026-11-17 |

## Visual contract

- `DESIGN.md` mirrors canonical runtime tokens in `frontend/src/styles.css`; changes update both together.
- Supported themes: light and dark for authenticated routes. The top-bar toggle persists the explicit choice locally; without one, the initial theme follows the system preference. Global scrollbar and focus behavior belong to the application stylesheet and adapt with the active theme.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | Native `select` | Shared CSS + this contract | native | keyboard + build |
| Date | Authored read-only release calendar + `Intl.DateTimeFormat` | This contract | monthly display / local-time agenda | keyboard + locale + browser |
| Form | Labeled native fields + `Notice` | Shared CSS | create / edit | service tests + browser |
| Scrollbar | `frontend/src/styles.css` | `DESIGN.md` | stable gutter where needed | browser |
| Theme | `AppLayout` + semantic variables in `frontend/src/styles.css` | `DESIGN.md` + this contract | light / dark | build + browser |
| Action button | Shared `.primary`, `.ghost` and `.icon-button` recipes | `frontend/src/styles.css` + `DESIGN.md` | primary / utility / icon / danger | keyboard + theme + build |
| Dialog | App-owned modal with focus trap, inert background and focus restoration | This contract + sibling account/admin dialogs | standard / confirmation / long document | keyboard + narrow viewport + build |
| Toast/status | `Notice` | Shared component | warning / error / success | build |
| CRUD | Owner-filtered REST services | API + this contract | return / stay | Maven tests |
| Admin table | Semantic native table + server pagination | `/api/admin/users` + this contract | horizontal overflow on narrow screens | service tests + keyboard + browser |

## Component behavior

Buttons remain the same size while busy and expose visible focus. Search supports explicit submission and clear behavior when populated. Textareas use `resize: none`. Initial content loads use shared skeletons that match the final list, grid, statistics, table, calendar or detail geometry; background refreshes preserve stale content, and mutations never replace settled content with skeletons. Lists provide loading, empty, error and no-results states. Destructive actions are visually separated and require an app-owned confirmation when irreversible. The application top bar owns the only page title; content panels use contextual labels and sectional headings rather than repeating that title.

## Dataset navigation

Catalog and recommendation grids use bounded pagination in complete visual rows. The compact recommendation carousel announces the active page, pauses autoplay while focus is inside it, moves covers in the navigation direction and coalesces rapid input to the latest destination. With reduced motion, autoplay and directional travel stop; manual changes use a short opacity-only crossfade. Committed catalog query/filter/page state should move to URL parameters in a later shared pagination migration; current state is intentionally route-local and non-sensitive.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Feedback | Failure recovery |
|---|---|---|---|---|---|
| Add tracking | Catalog detail | Disabled save | Tracking | `Notice` | Preserve values |
| Add to wishlist | Wishlist search or catalog detail | Disabled action | Wishlist | `Notice` | Preserve query/title |
| Start wishlist title | Wishlist card | Disabled action | Stay; item moves to tracking | `Notice` | Keep item pending |
| Update progress | Tracking editor | Disabled save | Stay/close | `Notice` | Preserve values |
| Save chapter rating | Tracking card → chapter ratings | Disabled save | Stay on selected point | `Notice` | Preserve selection |
| Save note/comment | Story workspace | Disabled action | Stay in active tab | Inline status | Preserve input |
| Reveal future | Named warning action | None | Same conversation | Persistent revealed state | Reset when point changes |
| Browse releases | Calendar navigation | Stable reserved calendar | Stay in selected month/day | Inline agenda | Retry through shared reload |
| Filter catalog | Publication-status select | Stable reserved grid | First result page | Empty/no-results state | Keep query and selected status |
| Contact administration | Contact form | Disabled submit | Stay; reset fields | `Notice` | Preserve values and retry |
| Review users | Administration search/pagination | Stable table frame | Stay in dashboard | Range and total | Preserve stale rows; retry refresh |
| Review user progress | User row → progress action | Dialog loading state | Stay in dashboard | Aggregate reading/viewing totals | Keep dialog open; retry action |
| Change user role | User row → role action → explicit confirmation | Final action busy | Stay in dashboard | Row and admin totals update | Keep dialog open with selected role |
| Resolve contact message | Message action | Disable active message action | Stay in dashboard | Pending count updates | Preserve message; retry |
| Enter public product page | Direct visit to `/` while signed out | Complete first fold | Auth/register or internal section | Visible destination | Custom 404 for unknown routes |
| Recover account | Sign-in → Forgot your password or email link → `/reset-password` | Submit disabled | Same page with sign-in link | `Notice`, without revealing whether the email exists | Retry or request a new link |
| Choose analytics | Consent banner when GA is configured | No blocking state | Stay on current route | Banner closes | Reopen requires clearing saved preference |
| Renew session | Expiry dialog | Renewal action busy | Stay on current route | Dialog closes after new JWT | Expired/invalid JWT returns to auth with persistent notice |
| Delete account | Profile settings → two confirmations → typed username | Final danger action busy | Public auth route | Persistent deletion notice | Keep final confirmation open with retry/cancel |
| Change theme | Top-bar sun/moon button | Brief opaque palette veil; immediate with reduced motion | Stay on current route | Icon and accessible label update | Keep active-session choice if storage is unavailable |
| Review legal information | Sidebar footer → privacy/legal action | Immediate dialog open | Stay on current route | Document title and content visible | Escape/backdrop/close restores trigger focus |

## Navigation and responsive behavior

The sidebar becomes an overlay below 1040px. The application owns one content scroll region. Story workspace columns collapse below 760px; actions remain visible without hover. Focus must not be hidden behind the top bar. Below 480px, the authenticated top bar reflows into two rows so every action remains visible and the page title may wrap; destructive tracking confirmations stack above their actions.

`ADMIN` users receive an Administration link immediately beside the profile control; the link is absent for other roles and `/admin` remains protected on both client and server. The dashboard uses server pagination for accounts and horizontal table overflow on narrow screens. User search state remains route-local because it may contain an email address and must not enter browser history, analytics or shareable URLs.

The public root owns a sticky header, meaningful internal anchors and an above-fold primary CTA. Below 640px, a fixed mobile CTA becomes visible only once the hero CTA is outside the viewport. Unknown client routes render the branded 404 with recovery links and `noindex,nofollow`; public privacy, terms and legal-notice routes remain reachable without authentication.

The release calendar is a read-only monthly display, not a date picker. It contains only active tracked titles whose catalog status is `RELEASING` and whose source provides `nextReleaseAt`; completed and dropped entries are excluded. Dates and times use the active locale and the browser's local timezone. The UI never extrapolates later chapters from a single confirmed date. Days with releases expose the title, next episode/chapter and local time in a non-interactive tooltip on pointer hover and keyboard focus; the selected-day agenda is the persistent touch alternative.

Authentication uses a continuous decorative SVG loop of closed book, open pages and final Yomio mark. A second ambient tracking route continuously connects reading, viewing and recommendation nodes behind it. Neither layer delays or covers the form. Reduced-motion users retain the continuous state indication through slow opacity-only crossfades and pulses; page movement, translation, scaling and route travel are removed.

## Async, validation and permission

Mutations are pessimistic and duplicate submits are disabled. JWT access tokens last two hours by default. Five minutes before expiry, a modal offers explicit renewal through the authenticated refresh endpoint; expiry or an authenticated 401 clears local credentials across tabs and returns to authentication with a persistent notice. The server does not silently slide the session. Backend derives the owner from authentication; the client never supplies a user ID. Future community content is absent from default API responses, not merely blurred. Explicit reveal grants read access only. Notes and ratings remain owner-only and future records are excluded after progress reduction.

Catalog reads remain available to regular users, but every user-triggered catalog mutation requires `ADMIN`: full or typed refreshes, release-progress refreshes and searches with `importMissing=true`. Non-admin interfaces omit refresh controls and search only the local catalog; scheduled server refreshes remain an internal operation.

All four catalog routes share the same server-side publication-status filter. Changing it returns to page one and composes with the current text query without mutating catalog data.

`Contact us` is the final product destination in the authenticated sidebar. A compact footer below navigation exposes Privacy and Legal notice as buttons that open the existing documents in an app-owned modal without changing route. Submissions require a category, subject and message, derive the sender from the JWT and warn against including secrets. Messages are visible only in the admin inbox, unresolved items sort first, and account deletion removes the sender's contact messages through the documented cascade.

The administration API exposes account identity, email, role and whether current policies were accepted, plus aggregate account/message counts. An explicit per-user action may request aggregate reading/viewing progress, but the response never contains titles, notes, ratings or detailed activity. Only `ADMIN` may read these endpoints, change roles or resolve contact messages. Role changes require confirmation, cannot target the acting administrator and cannot remove the final administrator.

For catalog titles with status `RELEASING`, progress forms expose `UP_TO_DATE` instead of `COMPLETED` and bind it to the latest confirmed release. Once the catalog status becomes `FINISHED`, API responses normalize an up-to-date entry to completed when it has reached the final unit.

Progress percentage uses the final total when known and otherwise the latest confirmed release. Chapter ratings are owner-only, bounded by authenticated progress, and use `/ratings/:mediaId` as their explicit route while sharing the canonical rating component with the story workspace.

Account deletion is an irreversible hard delete initiated only by the authenticated owner. It requires two app-owned confirmations plus the exact username, remains open on server failure, and deletes the account and owned records through database cascades. Replies authored by other users survive because the deleted parent reference becomes null.

GA4 is disabled unless both the feature flag and measurement ID are supplied. Consent defaults to denied; the external tag is injected only after opt-in, SPA route changes send explicit page views, advertising storage stays denied and onboarding events use an allowlist without PII. Local-business schema and directions require verified name, address, locality, country and map URL; missing data produces an honest online-only state rather than fabricated location content.

## Verification

- Required: `mvnw.cmd test`, `npm run build`, premium static audit.
- Critical service evidence: progress boundary, spoiler lock, no-progress visitor and private-owner query tests.
- Browser matrix: current Chromium desktop plus a narrow viewport; Spanish is canonical copy review locale.
