---
version: alpha
name: "Yomio"
description: "A quiet personal reading ledger where progress is the boundary between memory and spoilers."
colors:
  primary: "#44736B"
  primaryDark: "#2D5B53"
  ink: "#1F252B"
  muted: "#60707A"
  canvas: "#F4F6F8"
  surface: "#FFFFFF"
  border: "#DFE5E8"
  warning: "#FFF8E6"
  danger: "#A33A2F"
  darkCanvas: "#0F171D"
  darkSurface: "#18232A"
  darkBorder: "#354750"
  darkText: "#EEF5F7"
typography:
  sans:
    fontFamily: "DM Sans Variable, DM Sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  utility:
    fontFamily: "DM Sans Variable, DM Sans, ui-sans-serif, system-ui, sans-serif"
rounded:
  DEFAULT: "0.4375rem"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.625rem"
spacing:
  control: "0.75rem"
  panel: "1.125rem"
  section: "1rem"
components:
  button: { minHeight: "2.625rem" }
  card: { border: "#DFE5E8" }
  dialog: { maxWidth: "60rem" }
---

# Yomio Design System

## Overview

Yomio feels like a well-kept reading journal: quiet paper-like surfaces, an ink-dark navigation rail and restrained teal markers. It serves recurring readers who need to resume a story quickly without seeing what comes next. The product register is practical and familiar; the memorable signature is the explicit “progress horizon” that visually separates safe content from spoilers. Runtime CSS in `frontend/src/styles.css` remains canonical; this file documents its intent and exact shared values.

## Colors

Teal is reserved for progress and safe/selected states. Primary actions use warm parchment with dark ink and a restrained coral icon signal; secondary and icon actions use translucent editorial glass. Warning cream protects spoiler boundaries, while red is limited to destructive or reporting actions. White surfaces sit on the cool gray canvas with visible borders; text never relies on color alone. Dark mode remaps the same semantic hierarchy onto petroleum canvas `#0F171D`, raised surface `#18232A`, border `#354750` and text `#EEF5F7`; it does not invert media or change intent colors. Catalog routes may use sky `#8EC5DD`, coral `#E35D7D` and mint `#9CE5D3` as low-area expressive accents. Charcoal navy and warm parchment replace large flat green/white fields across public entry points. Runtime CSS owns these values; they never replace semantic success, warning or danger colors.

## Typography

DM Sans is bundled locally and owns headings, controls, navigation and body copy. Headings use weight 700; controls and navigation use 500; reading text uses 400, with system fallbacks for resilience. Utility labels and numeric progress keep compact alignment without introducing a competing typeface.

## Layout

The desktop shell uses a collapsible rail and a single owned content scroller. The authenticated content canvas keeps its pale book-and-moon artwork in light mode and blue petroleum drawing in dark mode. The navigation rail uses a vertical ink-and-film texture under a strong navy veil, while authentication uses a nocturnal archive scene and a warm paper panel. Artwork stays decorative and cover-sized behind readable surfaces. Panels use a 16–18px rhythm and collapse to one column below 760px. Catalog pagination stays row-complete; story tools keep their selector and tabs visible before content. Loading, empty, locked and error states reserve usable space.

The unauthenticated root is a public product page, while the authenticated root remains the personal dashboard. Its visual direction is a cinematic opening sequence: editorial type and a layered, live progress horizon establish the product over an original nocturnal archive image, followed by a three-scene scroll narrative for discovery, progress and continuity. Warm mineral-paper imagery carries the lighter sections so the page keeps tactile depth without sacrificing text contrast. The composition stays capped and asymmetric on desktop, becomes a single readable reel on narrow screens and never hides content behind motion. Internal anchors lead to workflow, illustrative use cases, FAQs and acknowledgements. On narrow screens the persistent CTA appears only after the primary hero CTA leaves view, so the two never compete.

Administration uses an operational-ledger layout: a restrained status rail, four compact measures, a semantic account table and the contact queue. It keeps the same paper surfaces and teal hierarchy as the personal product, while denser rows and stable table framing support scanning without turning the route into a separate visual system.

Account rows expose compact, always-visible progress and role actions. Progress opens a bounded aggregate summary split into reading and viewing; role changes use the canonical dialog, native select and an explicit confirmation step. Dense row actions remain flat and quiet so the table stays scannable.

## Elevation & Depth

Borders and tonal layers carry hierarchy. Shadows are limited to top-level panels, menus and overlays; nested notes, comments and cards remain flat.

## Shapes

Controls and panels use 6–10px radii. Pills are reserved for media type and status. Circular shapes identify avatars or small progress tools, never primary actions.

## Components

All actions use native buttons or links with hover, focus-visible, disabled and busy states. The product shares one projection-control language: warm paper and dark ink for primary actions, a restrained circular coral icon signal, translucent glass for secondary/icon actions, one-pixel borders and soft optical depth. There are no cel wedges, comic offset shadows or hover lifts. Dense selectors, calendar cells, pagination dots and menu rows remain flat so repeated controls do not become visual noise. Forms own validation, use persistent labels and non-resizable textareas. Spoiler locks show the reason and require a named reveal action. Lucide is the sole icon family; icons supplement text except for universally understood, accessible icon buttons. Initial content fetches use shared, geometry-matched skeletons for grids, lists, statistics, tables, calendars and details; background refreshes preserve settled content and mutations keep their controls stable instead of replacing content with skeletons. The authenticated top bar owns the sun/moon theme toggle; the choice persists locally and otherwise follows the system preference. Theme changes remap semantic variables only while an opaque, brief wash covers the canvas; the icon compresses and settles without bounce, while reduced-motion users receive the color swap immediately. Most state motion is 180ms; the branded authentication sequence lasts about 800ms and recommendation transitions last about 500ms. The public landing uses one short entrance sequence, restrained hero parallax and scroll-triggered scene changes; it does not run decorative loops. Reduced-motion preferences remove translation, scaling, staggering, autoplay and continuous movement; essential state changes may retain a short opacity-only dissolve of at most 240ms.

Catalog controls keep their restrained paper-panel framing and low-contrast halftone corner, while their actions inherit the global projection-control treatment. The page canvas and textured navigation rail remain quiet enough for dense product work. The native select remains the canonical dropdown, so its platform-owned open popup is accepted even though only the closed trigger inherits the shared surface treatment.

Official brand assets live in `frontend/public`: the light wordmark is used on the ink-dark navigation rail, the dark wordmark belongs on light surfaces, and the standalone mark identifies collapsed or favicon-sized contexts. Product icons remain Lucide; the Yomio mark is identity, not an action icon.

## Do's and Don'ts

Authentication is the deliberate brand exception: an ink-dark stage presents a looping vector sequence from closed book to open pages to the Yomio bookmark-Y. SVG masks, page strokes, mint accents and a restrained halo make the transformation legible while petroleum green and mint remain the only identity colors. A secondary ambient route connects book, screen and recommendation nodes among abstract tracking cards, so the green field communicates the product rather than acting as empty decoration. Both layers loop continuously. Reduced motion keeps the loops but converts them to slow opacity-only crossfades and pulses, without translation, scaling or route travel.

The recommendation carousel preserves the catalog-card visual language. GSAP coordinates outgoing and incoming cover groups according to navigation direction; rapid input retains the latest requested destination and focus pauses autoplay. Reduced motion disables autoplay and direction travel, using only a 180ms crossfade for manual navigation.

Public trust content must remain evidential. Use cases are explicitly illustrative, never testimonials. Reviews require a real quote, attributable source and permission before publication. Address, directions and `LocalBusiness` structured data remain absent until verified business details are configured; the default product is online-only. Analytics is optional, loads only after explicit consent and never receives account identifiers or other PII.

- **Do:** make the reader's current point visible wherever community content can appear.
- **Do:** reuse panels, `Notice`, catalog cards and shared pagination across sibling flows.
- **Don't:** reveal future titles, previews, images or counts before explicit consent.
- **Don't:** use decorative gradients, hidden scrollbars or hover-only actions.
