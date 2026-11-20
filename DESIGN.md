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

Teal is reserved for primary actions, progress and safe/selected states. Warning cream protects spoiler boundaries, while red is limited to destructive or reporting actions. White surfaces sit on the cool gray canvas with visible borders; text never relies on color alone. Dark mode remaps the same semantic hierarchy onto petroleum canvas `#0F171D`, raised surface `#18232A`, border `#354750` and text `#EEF5F7`; it does not invert media or change intent colors. Catalog routes may use sky `#8EC5DD`, coral `#E35D7D` and mint `#9CE5D3` as low-area expressive accents: coral marks action energy, sky marks filters and mint ties the atmosphere back to Yomio. Runtime CSS owns these catalog-specific values. They never replace semantic success, warning or danger colors.

## Typography

DM Sans is bundled locally and owns headings, controls, navigation and body copy. Headings use weight 700; controls and navigation use 500; reading text uses 400, with system fallbacks for resilience. Utility labels and numeric progress keep compact alignment without introducing a competing typeface.

## Layout

The desktop shell uses a collapsible rail and a single owned content scroller. The authenticated content canvas uses the supplied transparent manga-corner artwork: the pale book-and-moon composition in light mode and the blue petroleum drawing in dark mode. Artwork stays decorative, centered and cover-sized behind readable surfaces. Panels use a 16–18px rhythm and collapse to one column below 760px. Catalog pagination stays row-complete; story tools keep their selector and tabs visible before content. Loading, empty, locked and error states reserve usable space.

The unauthenticated root is a public product page, while the authenticated root remains the personal dashboard. Its pre-scroll composition pairs a petroleum hero statement with the product's progress-horizon card; internal anchors lead to workflow, illustrative use cases, FAQs and acknowledgements. On narrow screens the persistent CTA appears only after the primary hero CTA leaves view, so the two never compete.

Administration uses an operational-ledger layout: a restrained status rail, four compact measures, a semantic account table and the contact queue. It keeps the same paper surfaces and teal hierarchy as the personal product, while denser rows and stable table framing support scanning without turning the route into a separate visual system.

Account rows expose compact, always-visible progress and role actions. Progress opens a bounded aggregate summary split into reading and viewing; role changes use the canonical dialog, native select and an explicit confirmation step. Dense row actions remain flat and quiet so the table stays scannable.

## Elevation & Depth

Borders and tonal layers carry hierarchy. Shadows are limited to top-level panels, menus and overlays; nested notes, comments and cards remain flat.

## Shapes

Controls and panels use 6–10px radii. Pills are reserved for media type and status. Circular shapes identify avatars or small progress tools, never primary actions.

## Components

All actions use native buttons or links with hover, focus-visible, disabled and busy states. Primary, secondary and icon actions across public and authenticated routes share the manga-control signature introduced by the catalog: a two-pixel ink frame, compact offset shadow, squared 3px corners and restrained coral/sky cel accent. Dense selectors, calendar cells, pagination dots and menu rows remain flat so repeated controls do not become visual noise. Forms own validation, use persistent labels and non-resizable textareas. Spoiler locks show the reason and require a named reveal action. Lucide is the sole icon family; icons supplement text except for universally understood, accessible icon buttons. The authenticated top bar owns the sun/moon theme toggle; the choice persists locally and otherwise follows the system preference. Theme changes remap semantic variables rather than duplicating component rules. Most state motion is 180ms; the branded authentication sequence lasts about 800ms and recommendation transitions last about 500ms. Reduced-motion preferences remove translation, scaling, staggering, autoplay and continuous movement; essential state changes may retain a short opacity-only dissolve of at most 240ms.

Catalog controls use a restrained manga-panel treatment: warm paper, a dark two-pixel ink frame, a compact offset shadow and one low-contrast halftone corner. Their shared action-button treatment now belongs to the whole product: coral marks primary energy and sky marks utility actions while retaining the semantic teal hierarchy. The page canvas and navigation rail keep the shared solid application treatment without route-specific blur. The native select remains the canonical dropdown, so its platform-owned open popup is accepted even though only the closed trigger inherits this treatment.

Official brand assets live in `frontend/public`: the light wordmark is used on the ink-dark navigation rail, the dark wordmark belongs on light surfaces, and the standalone mark identifies collapsed or favicon-sized contexts. Product icons remain Lucide; the Yomio mark is identity, not an action icon.

## Do's and Don'ts

Authentication is the deliberate brand exception: an ink-dark stage presents a looping vector sequence from closed book to open pages to the Yomio bookmark-Y. SVG masks, page strokes, mint accents and a restrained halo make the transformation legible while petroleum green and mint remain the only identity colors. A secondary ambient route connects book, screen and recommendation nodes among abstract tracking cards, so the green field communicates the product rather than acting as empty decoration. Both layers loop continuously. Reduced motion keeps the loops but converts them to slow opacity-only crossfades and pulses, without translation, scaling or route travel.

The recommendation carousel preserves the catalog-card visual language. GSAP coordinates outgoing and incoming cover groups according to navigation direction; rapid input retains the latest requested destination and focus pauses autoplay. Reduced motion disables autoplay and direction travel, using only a 180ms crossfade for manual navigation.

Public trust content must remain evidential. Use cases are explicitly illustrative, never testimonials. Reviews require a real quote, attributable source and permission before publication. Address, directions and `LocalBusiness` structured data remain absent until verified business details are configured; the default product is online-only. Analytics is optional, loads only after explicit consent and never receives account identifiers or other PII.

- **Do:** make the reader's current point visible wherever community content can appear.
- **Do:** reuse panels, `Notice`, catalog cards and shared pagination across sibling flows.
- **Don't:** reveal future titles, previews, images or counts before explicit consent.
- **Don't:** use decorative gradients, hidden scrollbars or hover-only actions.
