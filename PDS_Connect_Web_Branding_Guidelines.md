# PDS Connect — Web Branding Guidelines
**Version 2.1 · March 2026**

> **What's new in v2.1:** Added 5 previously undocumented patterns identified during mockup review — hover-to-expand sidebar behaviour, filter chip component, card selected state with accent bar variants, hero announcement badge, and the master-detail split panel layout used on the Matches page.

> **What's new in v2.0:** Expanded color palette to Blue + Teal + Cyan, overhauled interaction design with snappy micro-animations, haptic feedback patterns, magnetic hover effects, cursor choreography, and a bolder visual direction across web and dashboard.

---

## 1. Logo & Identity

### Logo Concept

PDS Connect uses a **text-based wordmark** paired with a minimal **connection icon** — two nodes bridged by a shared touchpoint. The icon directly represents the platform's core purpose: bringing the right businesses together through an intelligent middle ground.

**Reference file:** `PDS_Connect_Logo.svg`

### Wordmark Structure

```
[ ⬤ — ◆ — ⬤ ]  PDS Connect
```

- **Icon:** Two filled circles (business nodes) connected by a smooth arc, with a smaller accent dot at the apex — symbolising the connection point PDS facilitates
- **"PDS"** — Weight 800 (Extra Bold), Calm Blue `#2E7FD9` — the brand anchor
- **"Connect"** — Weight 400 (Regular), Carbon Black `#0D0D0D` — grounding the name
- **Tagline (optional):** `BUSINESS MATCHING PLATFORM` — Label size, Mid Gray, letter-spacing 1.8

### Logo Variants

| Variant | Background | Use Case |
|---------|-----------|----------|
| Primary – Light | White / Off-White | Default: website, documents, presentations |
| Primary – Dark | Carbon Black `#0D0D0D` | Hero sections, dark-mode, footers |
| Primary – Blue | Calm Blue `#2E7FD9` | Marketing banners, CTAs, branded materials |
| Compact (no tagline) | Any | Navbar, app header, tight spaces |
| Icon only | Any | Favicon, profile avatar, app icon, loading spinner |

### Typeface in Logo

```
"PDS"       → font-weight: 800  |  letter-spacing: -0.5px
"Connect"   → font-weight: 400  |  letter-spacing: -0.3px
Tagline     → font-weight: 600  |  letter-spacing: 1.8px  |  ALL CAPS
```

> The contrast between bold "PDS" and regular "Connect" creates visual hierarchy — PDS is the institution, Connect is the promise.

### Clear Space Rule

Minimum clear space on all four sides = **height of the "P" character** in the wordmark. Never crowd the logo with other elements.

### Minimum Sizes

| Context | Min Width |
|---------|-----------|
| With tagline (full lockup) | 200px |
| Compact (wordmark only) | 130px |
| Icon only | 24px |

### Logo Color Rules

**On light backgrounds:**
- Icon nodes: Calm Blue `#2E7FD9`
- Icon arc/apex dot: Sky Blue `#5BABF0`
- "PDS": Calm Blue `#2E7FD9`
- "Connect": Carbon Black `#0D0D0D`

**On dark/black backgrounds:**
- Icon nodes: Sky Blue `#5BABF0`
- Icon apex dot: Pure White
- "PDS": Sky Blue `#5BABF0`
- "Connect": Pure White `#FFFFFF`

**On Calm Blue background:**
- All elements: Pure White or white at 88% opacity

### What Not To Do

- Never recolor "PDS" and "Connect" the same weight or color — the contrast is intentional
- Never stretch, skew, or rotate the logo
- Never use the tagline at sizes below 160px total width
- Never place the logo on a busy photographic background without a scrim or solid container
- Never recreate the wordmark in a different typeface
- Never add drop shadows or decorative effects to the logo

---

## 2. Brand Essence

PDS Connect is a professional business matching platform built on trust, clarity, and intelligent connection. The visual identity reflects **calm authority with electric energy** — approachable yet sophisticated, structured yet dynamic. Every design decision reinforces the brand promise: connecting the right businesses, effortlessly.

**Design Pillars:**
- **Clarity** — Information is easy to find, easy to read, easy to act on
- **Confidence** — Layouts feel stable and trustworthy, never cluttered
- **Connection** — Interactions feel alive, responsive, and deeply satisfying
- **Electric Motion** — Animations are snappy, purposeful, and reward user attention
- **Haptic Language** — Every meaningful action has tactile feedback — the interface speaks through touch

---

## 3. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sky Blue | `#5BABF0` | `91, 171, 240` | Primary highlights, active states, glows |
| Calm Blue | `#2E7FD9` | `46, 127, 217` | Headers, primary nav, section anchors |
| Deep Blue | `#1A5FAA` | `26, 95, 170` | Hover on primary buttons, footer anchors |
| Off-White | `#F5F8FC` | `245, 248, 252` | Page backgrounds, card surfaces |
| Pure White | `#FFFFFF` | `255, 255, 255` | Text on dark/blue/teal backgrounds |

### Teal & Cyan Expansion (New in v2.0)

These colors expand the blue family with fresh, tech-forward energy. Use them as **accent and action colors** — they create exciting contrast against the blue base without breaking brand cohesion.

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Electric Cyan | `#00D4FF` | `0, 212, 255` | Glow effects, neon highlights, active indicators |
| Vivid Cyan | `#06B6D4` | `6, 182, 212` | CTA accents, badges, link highlights, chart fills |
| Teal | `#14B8A6` | `20, 184, 166` | Success states, matching indicators, tags |
| Deep Teal | `#0D9488` | `13, 148, 136` | Hover states for teal elements, deep accents |
| Cyan Tint | `#ECFEFF` | `236, 254, 255` | Light backgrounds for teal/cyan highlights |

### Counter & Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Carbon Black | `#0D0D0D` | `13, 13, 13` | Strong headings on white, counter-color sections |
| Ink Gray | `#3A3A3A` | `58, 58, 58` | Body text, subheadings on light backgrounds |
| Mid Gray | `#8A8A8A` | `138, 138, 138` | Secondary text, placeholders, captions |
| Light Border | `#D8E6F5` | `216, 230, 245` | Dividers, card borders, input outlines |
| Pale Blue Tint | `#EEF5FC` | `238, 245, 252` | Section alternates, feature card backgrounds |

### Gradient System (New in v2.0)

Gradients are the signature visual element of the v2.0 design language. They add depth, energy, and brand character.

```css
/* Primary brand gradient — use for hero sections, CTAs, accent cards */
--gradient-brand:       linear-gradient(135deg, #2E7FD9 0%, #06B6D4 50%, #14B8A6 100%);

/* Electric accent — use for glow halos, featured badges, highlighted borders */
--gradient-electric:    linear-gradient(135deg, #5BABF0 0%, #00D4FF 100%);

/* Deep gradient — use for dark sections, dashboard sidebars, footers */
--gradient-deep:        linear-gradient(135deg, #1A5FAA 0%, #0D9488 100%);

/* Aurora mesh — use as hero section background texture */
--gradient-aurora:      radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.18) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 20%, rgba(46,127,217,0.22) 0%, transparent 60%),
                        radial-gradient(ellipse at 60% 80%, rgba(20,184,166,0.15) 0%, transparent 60%),
                        #0A1628;

/* Shimmer sweep — use for skeleton loaders and hover shimmer effects */
--gradient-shimmer:     linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.12) 50%, transparent 100%);
```

### Color Usage Principles

**Dark sections (hero, feature callouts):**
- Background: `Carbon Black (#0D0D0D)` with aurora mesh overlay
- Text: `Pure White (#FFFFFF)`
- Accent: `Electric Cyan (#00D4FF)` or `Sky Blue (#5BABF0)`
- CTA glow: `rgba(0, 212, 255, 0.35)` box-shadow

**Light sections (content, features, cards):**
- Background: `Off-White (#F5F8FC)` or `Pure White`
- Text: `Ink Gray (#3A3A3A)`
- Headings: `Carbon Black (#0D0D0D)`
- Primary accent: `Calm Blue (#2E7FD9)`
- Secondary accent: `Vivid Cyan (#06B6D4)`

**Interactive emphasis:**
- Hover glows: `rgba(0,212,255,0.3)` on dark · `rgba(46,127,217,0.18)` on light
- Active borders: Electric Cyan `#00D4FF` at full opacity on dark surfaces
- Success/match states: Teal `#14B8A6`

**Avoid:** Using Calm Blue text on Off-White backgrounds for small body copy — ensure contrast ratio is always ≥ 4.5:1 (WCAG AA).

---

## 4. Typography

### Typeface Stack

```
Primary:    'Inter', 'DM Sans', sans-serif
Display:    'Sora', 'Plus Jakarta Sans', sans-serif
Mono:       'JetBrains Mono', 'Fira Code', monospace  (data/stats only)
```

> **Rationale:** Inter provides excellent screen legibility at all sizes. Sora or Plus Jakarta Sans bring a modern, slightly editorial weight for display headings — echoing the bold typographic confidence seen in the Clarity and JIFF references.

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display-xl` | 72px | 700 | 1.05 | -0.03em | Hero banner, landing splash |
| `display-lg` | 56px | 700 | 1.1 | -0.02em | Section headlines |
| `heading-1` | 40px | 700 | 1.2 | -0.01em | Page titles |
| `heading-2` | 32px | 600 | 1.25 | -0.01em | Section subtitles |
| `heading-3` | 24px | 600 | 1.3 | 0 | Card titles, feature heads |
| `heading-4` | 20px | 600 | 1.4 | 0 | Labels, sub-features |
| `body-lg` | 18px | 400 | 1.6 | 0 | Intro paragraphs |
| `body-md` | 16px | 400 | 1.65 | 0 | Standard body copy |
| `body-sm` | 14px | 400 | 1.6 | 0.01em | Secondary info, captions |
| `label` | 12px | 600 | 1.4 | 0.08em | Tags, badges, nav items |
| `stat` | 48–64px | 700 | 1.0 | -0.02em | Counter numbers, KPIs |

### Typography Rules

- **Headings on dark backgrounds:** Always `Pure White`
- **Headings on light backgrounds:** `Carbon Black` or `Calm Blue`
- **Body on light backgrounds:** `Ink Gray (#3A3A3A)`
- **Never** use Medium Gray for body text — only for metadata/captions
- Maximum line length: **70 characters** for body paragraphs
- Headlines should **break intentionally** — avoid awkward orphan words
- **Gradient text** (use sparingly on hero headlines only): clip text to `--gradient-brand` for maximum visual impact

```css
/* Gradient text — heroes and key display headlines only */
.text-gradient {
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 5. Layout & Grid System

### Grid

```
Max content width:    1280px
Outer gutters:        80px (desktop) · 40px (tablet) · 20px (mobile)
Column count:         12 (desktop) · 8 (tablet) · 4 (mobile)
Column gap:           24px
```

### Section Spacing

| Context | Spacing |
|---------|---------|
| Between full sections | 120px (desktop) · 80px (tablet) · 60px (mobile) |
| Within section (heading to content) | 48px |
| Between cards in a grid | 24px |
| Card internal padding | 32px |
| Vertical rhythm unit | 8px base grid |

### Layout Patterns

**Hero Section:** Full-width, min-height 90vh. Aurora mesh gradient background (dark navy base with radial cyan/teal glows). Large display heading with optional gradient text. One CTA button primary (with glow), one ghost secondary. Animated mesh orbs floating subtly in background.

**Stats/Counter Bar:** Full-width, Carbon Black or Calm Blue. Large `stat` typography in white. 3–4 metrics separated by subtle vertical dividers in teal. Numbers animate up on scroll-enter with cyan glow flash at completion.

**Feature Cards Grid:** 3-column grid (desktop). Off-White background section. Cards with white surface, `Light Border` outline, 16px border-radius. Icon top-left with gradient background (blue→cyan). Heading + body + optional "Learn more →" link that slides right on hover.

**Testimonials:** Dark section (Carbon Black). Quote in large italic white type. Author name in Electric Cyan. Profile images in circular crop with cyan border ring.

**CTA Banner:** Full-width, brand gradient background (blue→teal). Centered heading in white. Two buttons (Primary + Ghost). Subtle animated particle/dot pattern in background.

---

## 6. Components

### Buttons

```
Primary Button
  Background:     var(--gradient-brand)  [135deg, #2E7FD9 → #06B6D4]
  Text:           White, weight 600
  Border:         none
  Border-radius:  8px
  Padding:        14px 28px
  Font:           label size, weight 600
  Transition:     all 150ms cubic-bezier(0.34, 1.56, 0.64, 1)  [spring]
  Hover:          translateY(-3px) · scale(1.02)
                  box-shadow: 0 8px 24px rgba(6,182,212,0.40)
                  background-position shift (shimmer sweep)
  Active:         translateY(0) · scale(0.98) · brightness(0.92)
                  → triggers haptic: LIGHT pulse
  Focus:          2px outline offset Electric Cyan

  ⚡ Magnetic attraction: cursor within 60px triggers subtle translateX/Y toward cursor

Ghost Button
  Background:     transparent
  Text:           Calm Blue (on light) or White (on dark)
  Border:         1.5px solid currentColor
  Border-radius:  8px
  Padding:        14px 28px
  Hover:          background → Cyan Tint (on light) · rgba(0,212,255,0.08) (on dark)
                  border-color → Vivid Cyan (#06B6D4)
                  color → Vivid Cyan
  Transition:     all 200ms ease

Cyan CTA Button (NEW — v2.0)
  Background:     Vivid Cyan (#06B6D4)
  Text:           White
  Hover:          background → Deep Teal (#0D9488)
                  box-shadow: 0 8px 24px rgba(6,182,212,0.45)
                  translateY(-3px)
  Active:         scale(0.97) → triggers haptic: LIGHT pulse

Icon Button (circular)
  Size:           44px × 44px
  Border-radius:  50%
  Background:     Pale Blue Tint
  Icon color:     Calm Blue
  Hover:          background → Cyan Tint
                  icon → Vivid Cyan
                  scale(1.12)
                  box-shadow: 0 0 16px rgba(6,182,212,0.30)
```

### Haptic Feedback Patterns (New in v2.0)

Haptic feedback makes the interface feel physical and deeply satisfying. Implement via the **Vibration API** on mobile browsers and **simulated spring physics** on desktop.

```javascript
// Haptic pattern constants — use consistently across all interactions
const HAPTIC = {
  LIGHT:    [10],           // Button tap, checkbox toggle
  MEDIUM:   [20],           // Card selection, important action confirmed
  HEAVY:    [40],           // Error, destructive action, alert
  SUCCESS:  [10, 50, 20],   // Match found, form submitted, task complete
  ERROR:    [40, 30, 40],   // Validation fail, connection error
  TICK:     [5],            // Slider tick, scroll snap, tab switch
  DOUBLE:   [10, 30, 10],   // Notification, badge pop
};

// Usage
function triggerHaptic(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
  // On desktop: trigger spring CSS animation on element instead
}
```

**When to trigger haptics:**

| Interaction | Haptic Pattern | Notes |
|-------------|----------------|-------|
| Primary button press | `LIGHT` | On pointerdown, not pointerup |
| Card select/expand | `MEDIUM` | Confirms selection |
| Form submit success | `SUCCESS` | Celebrate the moment |
| Validation error | `ERROR` | Clear alert signal |
| Toggle switch | `TICK` | Each toggle |
| Tab / nav switch | `TICK` | Feels snappy |
| Drag snap to position | `LIGHT` | On drop/snap |
| Match found notification | `DOUBLE` | Premium moment |
| Destructive action | `HEAVY` | Warns before proceeding |
| Slider value change | `TICK` | Every discrete step |

**Desktop spring simulation (no vibration):**
```css
/* Applied on button active state for "press feel" */
@keyframes spring-press {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.96); }
  70%  { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.btn:active { animation: spring-press 200ms cubic-bezier(0.34, 1.56, 0.64, 1); }
```

### Navigation

```
Navbar
  Background:     rgba(10, 22, 40, 0.70) + blur backdrop (dark hero context)
                  OR: rgba(255,255,255,0.85) + blur (light context)
  Height:         72px
  Logo:           Left-aligned
  Links:          Ink Gray / White, font-size 15px, weight 500
  Active link:    Electric Cyan (#00D4FF), bottom border 2px Electric Cyan
  Link hover:     Vivid Cyan, underline scale-in from left (150ms)
                  → subtle cyan glow: text-shadow 0 0 12px rgba(0,212,255,0.40)
  Scroll trigger: backdrop-filter: blur(20px) saturate(1.6)
                  height: 72px → 60px · box-shadow: 0 1px 24px rgba(6,182,212,0.12)
  CTA:            Cyan CTA button, right-aligned

Mobile nav:       Full-screen overlay, Carbon Black with aurora gradient, links in white
                  Links stagger in with spring animation (80ms between each)
```

### Cards

```
Standard Card
  Background:     White
  Border:         1px solid Light Border (#D8E6F5)
  Border-radius:  16px
  Padding:        32px
  Shadow:         0 2px 12px rgba(46,127,217, 0.06)
  Hover:
    Shadow:       0 12px 40px rgba(6,182,212, 0.18)
    Transform:    translateY(-6px) scale(1.01)
    Border-color: Vivid Cyan (#06B6D4)
    Border-width: 1.5px
    → top edge: 2px gradient accent line (blue→cyan) appears
  Transition:     all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)

Feature Card (with icon)
  As above +
  Icon container: 48px, gradient bg (blue→cyan diagonal), 12px radius
  Icon:           24px, White

Profile/Match Card
  Border-radius:  20px
  Top accent bar: 4px gradient line, Calm Blue → Electric Cyan
  Avatar:         64px circle, border 2px Vivid Cyan
  Match score:    Bold stat text, gradient text (blue→cyan)
  Hover:          Lift + cyan glow (box-shadow: 0 0 32px rgba(0,212,255,0.25))
                  Haptic: MEDIUM on click/select

Glass Card (dark context)
  Background:     rgba(255,255,255,0.06)
  Backdrop:       blur(20px) saturate(1.3)
  Border:         1px solid rgba(0,212,255,0.18)
  Border-radius:  20px
  Hover:          border-color → rgba(0,212,255,0.50)
                  box-shadow: 0 0 32px rgba(0,212,255,0.15)
                  translateY(-4px)
```

### Card Selected State (New in v2.0)

A selected card is one the user has **actively chosen** — it persists until another card is selected or the selection is cleared. This is distinct from hover (transient) and active/press (momentary).

```
Selected state (light context)
  Border:         2px solid Electric Cyan (#00D4FF)
  Box-shadow:     0 0 0 3px rgba(0,212,255,0.15),    ← outer focus ring
                  0 12px 36px rgba(6,182,212,0.20)   ← elevated shadow
  Transform:      translateY(-5px)                    ← stays lifted, doesn't return
  Background:     White (unchanged)
  Top accent bar: appears immediately (if card has accent bar variant)
  Transition:     border + shadow 150ms spring · transform 150ms spring

Selected state (dark / glass context)
  Border:         2px solid rgba(0,212,255,0.70)
  Box-shadow:     0 0 0 3px rgba(0,212,255,0.12),
                  0 0 40px rgba(0,212,255,0.20)
  Transform:      translateY(-4px)

On selection (click)
  1. Cyan ripple emits from click point (400ms, scale 0→5, opacity 0)
  2. Border instantly jumps to Electric Cyan (no transition — snappy)
  3. Outer glow ring fades in over 150ms
  4. Haptic: MEDIUM fires on pointerdown
  5. Previously selected card deselects: border returns to default, shadow drops,
     translateY returns to 0 — all over 200ms ease-out

Accent bar colour variants (top 4px bar on match cards)
  Default:        linear-gradient(90deg, #2E7FD9, #06B6D4)  ← blue→cyan
  Teal variant:   linear-gradient(90deg, #14B8A6, #06B6D4)  ← teal→cyan (use for CleanTech, ESG)
  Deep variant:   linear-gradient(90deg, #1A5FAA, #2E7FD9)  ← deep→blue (use for Finance, PE)
  Choose variant based on the company's primary industry tag
```

### Form Inputs

```
Input field
  Height:           48px
  Border:           1.5px solid Light Border
  Border-radius:    8px
  Background:       White
  Text:             Ink Gray
  Placeholder:      Mid Gray
  Padding:          0 16px
  Focus:
    Border-color:   Vivid Cyan (#06B6D4)
    Box-shadow:     0 0 0 3px rgba(6,182,212, 0.18)
                    + inset glow: 0 0 8px rgba(6,182,212,0.06)
    Transition:     150ms spring
  Transition:       border 150ms, box-shadow 150ms

Label:  font-size 14px, weight 600, Carbon Black, margin-bottom 6px
Error:  border-color #E53E3E, helper text in red below, haptic: ERROR
Success: border-color Teal (#14B8A6), checkmark icon in teal, haptic: SUCCESS (if major)
```

### Tags & Badges

```
Industry tag:    Cyan Tint bg · Vivid Cyan text · 6px radius · label size
                 Hover: bg → Vivid Cyan · text White · scale(1.05)

Status badge:    Filled bg (color-coded) · White text · pill shape
  Active:        Teal (#14B8A6) bg
  Pending:       Amber (#F59E0B) bg
  Inactive:      Mid Gray bg

Match score:     Gradient bg (blue→cyan) · White text · bold · pill shape
                 Glow: 0 0 12px rgba(6,182,212,0.40)
```

### Filter Chips (New in v2.0)

Filter chips are **selectable toggle buttons** used to filter or segment content — distinct from static tags. They appear in a horizontal row above filterable lists, card grids, or tables.

```
Default state
  Background:     White
  Border:         1.5px solid Light Border (#D8E6F5)
  Border-radius:  99px (pill)
  Padding:        7px 16px
  Font:           12px, weight 600, Mid Gray
  Transition:     all 120ms cubic-bezier(0.34, 1.56, 0.64, 1)

Hover state
  Border-color:   Vivid Cyan (#06B6D4)
  Text color:     Vivid Cyan
  Background:     Cyan Tint (#ECFEFF)
  Transform:      scale(1.04)

Active / selected state
  Background:     var(--gradient-brand)  [blue→cyan→teal]
  Border:         none (transparent)
  Text color:     White
  Box-shadow:     0 4px 14px rgba(6,182,212,0.30)
  Transform:      scale(1.0)  [no lift — selected state feels anchored]
  Haptic:         TICK on selection

Behaviour rules
  — Only one chip active at a time (single-select) unless explicitly multi-select
  — "All" chip is always first and is active by default
  — On click: active chip snaps instantly (120ms spring), content re-filters with
    a 180ms cross-fade
  — Never disable chips — grey them out at 40% opacity if a filter yields 0 results
    and show a tooltip explaining why
  — On mobile: chips scroll horizontally with no wrap, -webkit-overflow-scrolling: touch
```

**Filter bar layout:**
```
[ All Matches ] [ SaaS / Tech ] [ FinTech ] [ CleanTech ] [ 90%+ Score ]   [🔍 Search...]
←— filter chips ———————————————————————————————————————————————————→  search right-aligned
Gap between chips: 8px
Search input: margin-left: auto · min-width 200px · same height as chips (38px)
```

---

## 7. Cursor & Pointer Design (New in v2.0)

A custom cursor system makes the interface feel premium and polished. Implement with a small JavaScript cursor tracker.

```
Default cursor:     Standard OS cursor (don't override globally)

Interactive glow:   On hover of any interactive element (button, card, link):
                    Render a 200px radial gradient "glow halo" that follows cursor
                    color: rgba(0,212,255,0.06) on light · rgba(0,212,255,0.10) on dark
                    This is the "aurora cursor" effect — subtle, elegant

Magnetic elements:  Buttons and icon buttons attract cursor within 60px radius
                    Element translates toward cursor at 30% of cursor offset
                    Returns with spring animation on mouse leave

Click ripple:       On click of any interactive element, emit a ripple ring
                    Color: rgba(6,182,212,0.30) · Diameter: 80px → 0 opacity
                    Duration: 400ms · ease-out
```

---

## 8. Iconography

- **Style:** Outline icons, 1.5px stroke weight, rounded caps and joins
- **Set:** Lucide Icons or Phosphor Icons (consistent throughout)
- **Sizes:** 16px (inline), 24px (standard UI), 32px (feature highlights), 48px (hero icons)
- **Color:** Inherits from context — Calm Blue on light, White on dark, Vivid Cyan for emphasis
- **Icon hover:** Scale to 1.1 over 150ms spring, color shifts to Vivid Cyan
- **Never** use filled icons and outline icons in the same section
- **Animated icons:** Use Lottie or CSS animation for key interactions (loading, success checkmark, connection forming)

---

## 9. Imagery & Visual Style

### Photography
- **Tone:** Clean, well-lit, professional. Avoid overly staged stock imagery.
- **Color treatment:** Slightly cooled — blue-cyan tones preferred
- **Subjects:** Real professionals, collaborative environments, modern office/city settings
- **Overlay:** When text sits over images, use `rgba(10,22,40,0.55)` scrim or `linear-gradient(to right, rgba(26,95,170,0.85), rgba(6,182,212,0.30))`

### Illustrations & Graphics
- **Style:** Minimal flat vector or soft 3D blobs/orbs with cyan/teal glow
- **Palette:** Restricted to the brand palette only
- **Background graphics:** Subtle dot grids, aurora mesh gradients, or geometric node-line patterns (network/connection metaphor) with teal accent nodes

### Data Visualization
- **Primary color:** Calm Blue / Vivid Cyan
- **Secondary:** Teal (#14B8A6) for second data series
- **Tertiary:** Sky Blue (#5BABF0) for supplementary data
- **Background fill:** Pale Blue Tint / Cyan Tint
- **Avoid** red/green-only coding for accessibility
- Charts should use the full blue-teal scale before introducing neutrals

---

## 10. Animation & Interaction

> All motion follows: **snappy, purposeful, deeply satisfying.** Animations don't just guide — they reward. Every interaction should feel as if the interface is alive and responding specifically to the user's touch.

### Timing Tokens

```css
--duration-instant:   80ms     /* Haptic + visual state feedback (active press) */
--duration-snap:      120ms    /* Tab switch, toggle, chip select */
--duration-fast:      150ms    /* Hover transitions, icon swaps, color shifts */
--duration-base:      250ms    /* Card lifts, button states, standard transitions */
--duration-moderate:  350ms    /* Panel slides, tab panel switch */
--duration-slow:      500ms    /* Modal entry, drawer open */
--duration-reveal:    700ms    /* Scroll-triggered content, section entrance */
--duration-counter:   1200ms   /* Number count-up animations */

--ease-standard:      cubic-bezier(0.4, 0, 0.2, 1)      /* General purpose */
--ease-out:           cubic-bezier(0, 0, 0.2, 1)         /* Entering elements */
--ease-in:            cubic-bezier(0.4, 0, 1, 1)         /* Exiting elements */
--ease-spring:        cubic-bezier(0.34, 1.56, 0.64, 1)  /* Springy: buttons, cards, icons */
--ease-bounce:        cubic-bezier(0.68, -0.55, 0.27, 1.55) /* Playful: badges, notifications */
--ease-snap:          cubic-bezier(0.77, 0, 0.175, 1)    /* Snappy menu transitions */
```

### Scroll-Triggered Animations

**Fade + Rise (default entry):**
```css
Initial:    opacity: 0;  transform: translateY(20px)
Animated:   opacity: 1;  transform: translateY(0)
Duration:   500–700ms · ease-out
Stagger:    60ms between sibling elements (snappier than v1.0's 80ms)
Threshold:  Trigger at 15% element visibility
```

**Cyan Flash on entry (for key stats/highlights):**
```css
When stat card enters viewport:
  1. Count up animation begins
  2. At completion: box-shadow briefly pulses to 0 0 24px rgba(0,212,255,0.40)
  3. Pulse fades over 400ms
```

**Counter Number Animation:**
```
Animate from 0 → target value over 1000ms (snappier than v1.0's 1200ms)
Easing: ease-out cubic
Trigger: When stat section enters viewport
At completion: number briefly scales to 1.06 with spring ease, returns to 1
Format: Include commas/suffixes (1,200+, 95%, etc.)
```

**Horizontal Slide (for testimonials / carousels):**
```
Cards slide in from right: translateX(32px) → translateX(0)
Duration: 350ms · ease-out
```

### Hover Interactions

> Every hover effect should be immediately perceptible — fast, clear, satisfying. No sluggish fades.

| Element | Hover Effect | Duration |
|---------|-------------|----------|
| Cards | `translateY(-6px) scale(1.01)` + cyan shadow + border tint | 250ms spring |
| Primary button | `translateY(-3px) scale(1.02)` + cyan glow | 150ms spring |
| Cyan button | `translateY(-3px)` + deep teal bg + bright glow | 150ms spring |
| Ghost button | Cyan border + Cyan bg tint + text color shift | 200ms ease |
| Nav links | Vivid Cyan color + underline scale-in + subtle text glow | 150ms |
| Icon buttons | `scale(1.12)` + cyan glow ring | 150ms spring |
| Images in cards | `scale(1.05)` with `overflow: hidden` on container | 300ms ease |
| CTA arrow/icon | `translateX(6px)` + icon color → Electric Cyan | 150ms spring |
| Tags / badges | `scale(1.05)` + color invert (bg fill) | 120ms spring |
| Table rows | bg → #EBF9FC (cyan tint) + left border 2px Vivid Cyan | 100ms — must feel instant |
| Logo | `scale(1.03)` with spring ease | 200ms spring |
| Match score badge | Glow pulse: box-shadow expands then contracts | 300ms ease |

### Click / Active Interactions

```
All interactive elements:
  Pointerdown:  scale(0.96–0.98) over 80ms · brightness(0.90)
  Pointerup:    spring back: scale(1.03) → scale(1) over 200ms spring

Buttons specifically:
  spring-press animation (see Haptic section) runs on click

Card click/select:
  Border flashes to Electric Cyan for 200ms then settles to Vivid Cyan
  Row in data table: left border instantly to Vivid Cyan
```

### Navbar Scroll Behavior

```
On scroll Y > 20px:
  - backdrop-filter: blur(20px) saturate(1.6)
  - Background: rgba(10,22,40,0.85) on dark / rgba(255,255,255,0.90) on light
  - Reduce height: 72px → 62px
  - Add: box-shadow: 0 1px 32px rgba(6,182,212,0.12)
  - Logo: slight scale-down (1.0 → 0.92) over 300ms
  Transition: all 250ms ease
```

### Page Transitions

- **Between pages:** Fade-out (150ms) → route change → fade-in content (250ms)
- **Modal / drawer entry:** Slide up from bottom with spring ease + backdrop cyan tint `rgba(0,212,255,0.04)`
- **Toast notifications:** Slide in from top-right with spring bounce, auto-dismiss with fade-out
- **Tab panel switch:** New panel slides in from direction of tab (left/right), 300ms snap ease

### Loading States

```
Skeleton screens:
  Color:      gradient shimmer: Light Border → Cyan Tint → Light Border
  Animation:  background-position sweep, 1.2s infinite (faster than v1.0's 1.5s)
  Shape:      Match target element proportions with 8px border-radius

Progress indicator:
  Color:      Vivid Cyan (#06B6D4) with glow: 0 0 8px rgba(6,182,212,0.50)
  Style:      Thin top-of-page bar (3px height) or circular spinner
  Circular spinner: cyan gradient arc that rotates — add cyan trail glow
```

### Ripple Effect System (New in v2.0)

```javascript
/* Apply to all clickable elements with data-ripple attribute */
function createRipple(element, event) {
  const circle = document.createElement('span');
  const rect = element.getBoundingClientRect();
  circle.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(6, 182, 212, 0.28);
    transform: scale(0);
    animation: ripple-expand 500ms ease-out forwards;
    pointer-events: none;
    left: ${event.clientX - rect.left}px;
    top: ${event.clientY - rect.top}px;
    width: 80px; height: 80px;
    margin: -40px;
  `;
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(circle);
  circle.addEventListener('animationend', () => circle.remove());
}

@keyframes ripple-expand {
  to { transform: scale(4); opacity: 0; }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* All transforms and transitions: disable or set to 0ms */
  /* Scroll animations: show immediately at final state */
  /* Counter animations: show final value immediately */
  /* Parallax effects: disable entirely */
  /* Haptics: still fire — they're accessibility-neutral */
  /* Ripples: disable */
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```
Always implement this media query. Accessibility is non-negotiable.

---

## 11. Spacing & Elevation

### Elevation (Shadow) Scale

```css
--shadow-xs:   0 1px 4px  rgba(46,127,217, 0.04);  /* Resting cards */
--shadow-sm:   0 2px 12px rgba(46,127,217, 0.06);  /* Default card */
--shadow-md:   0 4px 20px rgba(6,182,212, 0.10);   /* Raised elements — now cyan-tinted */
--shadow-lg:   0 8px 32px rgba(6,182,212, 0.18);   /* Hover card */
--shadow-xl:   0 16px 48px rgba(6,182,212, 0.22);  /* Modal, floating panels */
--shadow-glow-blue:  0 0 24px rgba(91,171,240,0.30);    /* Active/featured items */
--shadow-glow-cyan:  0 0 32px rgba(0,212,255,0.35);     /* Highlighted/selected items */
--shadow-glow-teal:  0 0 20px rgba(20,184,166,0.30);    /* Success/match confirmed */
```

> Shadow colors shift from Calm Blue (v1.0) to Vivid Cyan (v2.0) for hover/elevated states — this creates a luminous, electric depth that feels alive.

---

## 12. Section Templates

### Hero Announcement Badge (New in v2.0)

A small pill-shaped label that sits **above the hero headline** to signal a launch, update, or live status. It draws the eye before the headline and sets context immediately.

```
Structure:      [ ● dot ]  [ LABEL TEXT IN CAPS ]

Container
  Display:        inline-flex, align-items center, gap 8px
  Padding:        6px 16px
  Border-radius:  99px (pill)
  Border:         1px solid rgba(0,212,255,0.25)
  Background:     rgba(0,212,255,0.08)
  Margin-bottom:  28px

Status dot (left)
  Size:           6px × 6px circle
  Color:          Teal (#14B8A6) for "live / active" · Electric Cyan for "new / launch"
  Glow:           box-shadow 0 0 6px currentColor
  Animation:      opacity 1 → 0.4 → 1, 2s infinite (pulse)

Label text
  Font-size:      12px
  Font-weight:    700
  Letter-spacing: 0.08em
  Color:          Electric Cyan (#00D4FF)
  Text-transform: UPPERCASE

Animation (on page load)
  Fades + rises with the first hero element: opacity 0 → 1, translateY(12px) → 0
  Duration: 500ms ease-out · no delay (leads the headline)

Copy guidelines
  Keep to 4–6 words max: "NOW LIVE — MATCHING 2.0", "NEW: AI RECOMMENDATIONS"
  Always action-oriented or status-oriented — not decorative
  Don't use on every page — reserve for genuine announcements or feature launches
```

---

### Hero Section
```
Background:     Aurora mesh gradient (#0A1628 base + radial cyan/teal glows)
Layout:         Text left (60%) · Visual right (40%) — or centered
Heading:        display-xl, White (top line optional gradient text: blue→cyan)
Subheading:     body-lg, rgba(White, 0.75)
CTA group:      Primary gradient button (glow) + Ghost white button, gap 16px
Animation:      Heading fades+rises (500ms), sub fades (700ms, 80ms delay),
                CTAs spring in (900ms, 160ms delay)
Visual:         Product screenshot in glass card shell,
                subtle float animation (translateY ±10px, 5s ease-in-out loop)
                Cyan glow ring around screenshot card
Background orbs: 2–3 large blurred radial gradients (cyan/teal),
                 animate slowly (rotate/drift over 30s)
```

### Stats / Trust Bar
```
Background:     Carbon Black
Layout:         4 stats in a row, centered, dividers between (cyan color)
Number:         stat token, Electric Cyan (#00D4FF)
Label:          label token, Mid Gray
Animation:      Counter animation on viewport entry + cyan glow flash at completion
```

### Feature Grid
```
Background:     Off-White or White
Intro:          Centered heading (heading-1) + body-lg, max-width 640px
Grid:           3-column (desktop), 2 (tablet), 1 (mobile)
Cards:          Feature cards with gradient icon containers
Animation:      Staggered spring entrance, 60ms between cards
```

### Testimonials
```
Background:     Carbon Black with subtle aurora overlay
Layout:         Single quote, centered, max-width 800px; or horizontal scroll of cards
Quote style:    heading-2, italic, White
Attribution:    Electric Cyan name + Mid Gray role
Author avatar:  Circular, border 2px Vivid Cyan with outer glow
Animation:      Fade in on scroll + cards slide from right
```

### CTA Banner
```
Background:     var(--gradient-brand) — Blue → Cyan → Teal
Layout:         Centered
Heading:        heading-1, White
Subtext:        body-md, rgba(White, 0.80)
Buttons:        Primary inverted (White bg, Calm Blue text) + Ghost white
Decoration:     Subtle animated dot/grid pattern at 5% opacity over gradient
```

---

## 13. Dashboard Design System

> The PDS Connect dashboard is where users spend most of their time. The visual language is a **focused, data-rich workspace** — snappy, airy, and deeply satisfying to interact with. Every state change is instant, every data update feels live, and every action rewards the user with clear visual and haptic confirmation.

---

### 13.1 Dashboard Layout Architecture

**Structure:** Sidebar navigation (left, fixed) + main content area (scrollable)

```
┌─────────────────────────────────────────────────┐
│  Topbar: breadcrumb · search · notif · avatar   │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │       Main Content Area              │
│  (240px) │       (fluid, max 1440px)            │
│          │                                      │
│  Nav     │  ┌──────┬──────┬──────┐             │
│  Items   │  │ Stat │ Stat │ Stat │  KPI Row    │
│          │  └──────┴──────┴──────┘             │
│  ──────  │                                      │
│          │  ┌──────────┬──────┬──────┐         │
│  Active  │  │  Large   │ Med  │ Med  │  Bento  │
│  state   │  │  Card    │      │      │  Grid   │
│          │  └──────────┴──────┴──────┘         │
└──────────┴──────────────────────────────────────┘
```

**Sidebar width:** 240px expanded · 72px collapsed (icon-only)
**Topbar height:** 64px, sticky
**Content padding:** 32px all sides (desktop) · 20px (tablet)
**Card gap:** 20px (bento grid gutter)

---

### 13.2 Dashboard Background & Surface

```
Page background:    linear-gradient(145deg, #EBF9FC 0%, #F5F8FC 50%, #E8F4F8 100%)
                    — subtle cyan-blue tinted gradient

Sidebar background: #FFFFFF with right border 1px solid #D8E6F5 (light variant)
                    OR: #0A1628 dark navy for dark sidebar variant

Topbar background:  rgba(255, 255, 255, 0.85)
                    backdrop-filter: blur(20px) saturate(1.6)
                    border-bottom: 1px solid rgba(6,182,212,0.12)
```

**Glass Card Surface (primary card style):**
```css
background:      rgba(255, 255, 255, 0.75);
backdrop-filter: blur(20px) saturate(1.3);
border:          1px solid rgba(6, 182, 212, 0.15);
border-radius:   20px;
box-shadow:      0 2px 16px rgba(6, 182, 212, 0.07),
                 inset 0 1px 0 rgba(255, 255, 255, 0.60);
transition:      all 250ms cubic-bezier(0.34, 1.56, 0.64, 1);

/* Hover state */
&:hover {
  border-color: rgba(6, 182, 212, 0.40);
  box-shadow:   0 8px 32px rgba(6, 182, 212, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.80);
  transform:    translateY(-3px);
}
```

**Solid Card Surface:**
```css
background:    #FFFFFF;
border:        1px solid #D8E6F5;
border-radius: 16px;
box-shadow:    0 2px 12px rgba(6, 182, 212, 0.06);
```

**Accent Card (featured):**
```css
background:    var(--gradient-brand);  /* Blue → Cyan → Teal */
border-radius: 20px;
color:         #FFFFFF;
box-shadow:    0 8px 32px rgba(6, 182, 212, 0.30);
```

---

### 13.3 Sidebar Navigation

**Light Sidebar (default):**
```
Background:         #FFFFFF
Border-right:       1px solid rgba(6,182,212,0.12)
Width:              240px (expanded) · 72px (collapsed)
Padding:            24px 16px

Logo zone:          Height 64px, logo left-aligned, divider below (cyan tint)
Nav item height:    44px
Nav item padding:   0 12px
Nav icon size:      20px
Nav label:          font-size 14px, weight 500, Ink Gray

Inactive state:     icon Mid Gray · label Ink Gray · bg transparent
Hover state:        bg Cyan Tint (#ECFEFF) · icon Vivid Cyan · label Carbon Black
                    Transition: 120ms snap ease
Active state:       bg Cyan Tint (#ECFEFF) · left border 3px gradient (blue→cyan)
                    icon Vivid Cyan (filled) · label Carbon Black, weight 600

Section labels:     ALL CAPS, 11px, Mid Gray, letter-spacing 1.2, margin-top 24px
Collapse toggle:    Bottom of sidebar, haptic: TICK on each collapse/expand
```

**Hover-to-expand behaviour (default interaction model):**

The sidebar uses a **hover-to-expand** pattern rather than a persistent toggle. This keeps the dashboard canvas wide while still offering full nav labels on demand.

```
Collapsed (default):    72px wide — icons only, labels hidden
Expanded (on hover):    220px wide — icons + labels visible
Transition:             width 220ms ease-in-out
Label fade-in:          opacity 0 → 1, 120ms, begins after width starts expanding
Label fade-out:         opacity 1 → 0, 80ms, leads the collapse (disappears first)

Mouse enter sidebar:    expand immediately (no delay)
Mouse leave sidebar:    collapse after 100ms delay (prevents accidental collapse)
Touch / mobile:         tap the hamburger icon instead — hover-expand is desktop only

Implementation note:
  Use CSS :hover on the sidebar element for pure-CSS solution,
  or JS mouseenter/mouseleave with a 100ms leave-timeout for more control.
  Never animate the main content area width in response — sidebar overlays content
  slightly on expand, it does not push the layout.

Tooltip on collapsed icons:
  When sidebar is collapsed, show a tooltip on nav icon hover
  Tooltip: bg Carbon Black · White text · body-sm · 8px radius · 4px left offset
  Appears after 350ms hover delay, disappears instantly on mouse leave
```

**Dark Sidebar (alternative):**
```
Background:         #0A1628  (deep navy)
Nav item inactive:  rgba(255,255,255,0.50)
Nav item hover:     rgba(0,212,255,0.10) bg · rgba(255,255,255,0.90) label
                    icon → Electric Cyan · 120ms snap
Nav item active:    rgba(0,212,255,0.12) bg · White label, weight 600
                    left border 3px Electric Cyan (#00D4FF) with glow
Section labels:     rgba(255,255,255,0.30)
```

---

### 13.4 Topbar

```
Height:             64px
Background:         Glass (see 13.2)
Left:               Breadcrumb — page name in heading-4, parent in Mid Gray
Center:             Search input — width 280px, focus → border Vivid Cyan + glow
Right:              Notification bell · Settings · Avatar + name + chevron

Avatar:             32px circle, border 2px gradient (blue→cyan)
Notification badge: 8px circle, Electric Cyan, spring-bounce in on new notification
                    Haptic: DOUBLE when new notification arrives
Dividers:           1px vertical, rgba(6,182,212,0.15), between right-side groups
```

---

### 13.5 KPI / Stat Cards (Top Row)

```
Card size:          Flex-grow, min 160px, height 108px
Layout:             Icon top-left (32px) · Value prominent · Label below

Value typography:   stat token (48px, weight 700), Carbon Black
Label typography:   body-sm (14px), Mid Gray
Delta indicator:    ↑ +12% in Teal (#14B8A6) or ↓ -3% in soft red (small, below label)
Icon container:     40px × 40px, gradient bg (blue→cyan), 10px radius, White icon

Hover:              Card lifts + cyan border glow
                    Icon container glows: box-shadow 0 0 16px rgba(6,182,212,0.40)

Variant — Accent:  Full brand gradient bg · all text white · icon white 70% opacity
                   box-shadow: 0 8px 32px rgba(6,182,212,0.35)
```

---

### 13.6 Bento Grid Layout

```
Grid system:        CSS Grid, 12 columns, 20px gap
Row height unit:    80px (cards snap to multiples)

Card size classes:
  .card-sm        → 3 col × 2 rows  (KPI stat, small widget)
  .card-md        → 4 col × 3 rows  (chart, list, calendar widget)
  .card-lg        → 6 col × 4 rows  (main feature, match list, analytics)
  .card-full      → 12 col × auto   (full-width table, pipeline view)
  .card-tall      → 3 col × 5 rows  (vertical profile card, feed)
```

**Recommended homepage bento layout:**
```
[ Profile/Welcome  3col ] [ Progress Chart  4col ] [ Quick Stats  5col ]
[ Match List (lg)  6col ] [ Activity Feed   3col ] [ Tasks Card   3col ]
[ Pipeline Table — full width 12col                                     ]
```

---

### 13.7 Data Visualisation Components

**Bar Charts:**
```
Bar color:          Vivid Cyan (#06B6D4) → gradient to Calm Blue at bar top
Inactive bars:      Cyan Tint (#ECFEFF) with Light Border outline
Hover bar:          Electric Cyan (#00D4FF), glow: 0 0 12px rgba(0,212,255,0.30)
Active/selected:    Deep Teal (#0D9488)
Grid lines:         1px dashed, Light Border, very subtle
Axis labels:        12px, Mid Gray
Tooltip:            Dark glass card, Vivid Cyan accent line, white text
Animation:          Bars grow from bottom, staggered 30ms, 400ms ease-out (snappier)
```

**Line / Area Charts:**
```
Line stroke:        2.5px, Vivid Cyan (#06B6D4)
Area fill:          linear-gradient(180deg, rgba(6,182,212,0.20) → transparent)
Data point dot:     6px, Vivid Cyan, Electric Cyan center ring on hover + glow
Hover crosshair:    1px dashed, rgba(6,182,212,0.30)
Animation:          Line draws left-to-right, 700ms ease-out
```

**Donut / Ring Charts:**
```
Track color:        Light Border (#D8E6F5)
Fill color:         Calm Blue → Vivid Cyan gradient
Stroke width:       10px (standard) · 6px (compact)
Center label:       stat token value + body-sm label
Glow:               box-shadow 0 0 16px rgba(6,182,212,0.25) on fill arc
Animation:          Stroke-dashoffset sweep, 900ms ease-out
```

**Progress Bars:**
```
Track:              Light Border, 6px height, 99px radius
Fill:               Calm Blue → Vivid Cyan → Teal gradient (left to right)
Label:              Percentage right-aligned, 12px, Mid Gray
Animation:          Width grows from 0, 500ms ease-out
On complete (100%): Glow pulse on bar, haptic: SUCCESS
```

**Data Tables:**
```
Header row:         bg Cyan Tint (#ECFEFF) · text Carbon Black · weight 600 · 12px ALL CAPS
                    bottom border 2px Vivid Cyan
Body rows:          White · border-bottom 1px Light Border · 48px row height
Hover row:          bg #EBF9FC · left border 2px Vivid Cyan · transition 100ms (instant)
Selected row:       bg Cyan Tint · left border 3px Electric Cyan
Sort icon active:   Vivid Cyan
Pagination:         Vivid Cyan active page button (filled), haptic: TICK on page change
```

---

### 13.8 Dashboard-Specific Components

**Profile / Identity Card:**
```
Background:         Brand gradient (blue→cyan→teal)
Avatar:             80px circle, border 3px White, outer ring glow
Name:               heading-3, White
Role/Company:       body-sm, rgba(White, 0.75)
Key metric:         stat token, White
Bottom:             2–3 icon buttons, white ghost style with cyan hover glow
```

**Match / Partner Card:**
```
Header accent:      4px top border, gradient blue→cyan
Company logo:       48px circle avatar, border 2px Vivid Cyan
Company name:       heading-4, Carbon Black
Industry tag:       Cyan Tint bg, Vivid Cyan text, pill
Match score badge:  Gradient bg (blue→cyan), White text, bold, top-right corner
                    Glow: 0 0 12px rgba(6,182,212,0.40)
Details row:        Icon + label pairs, body-sm, Ink Gray
CTA:                Full-width "Connect" button, gradient style, bottom of card
Hover:              Lift translateY(-6px) + shadow-glow-cyan + border Vivid Cyan
                    Haptic: MEDIUM on "Connect" click
```

**Status Dot Indicator:**
```
Active / Online:    8px circle, Teal (#14B8A6) + outer glow
Pending:            8px circle, Amber (#F59E0B)
Inactive:           8px circle, Mid Gray
Error / Blocked:    8px circle, #EF4444
Animation:          Active dots pulse gently (scale 1→1.3→1, 2s infinite)
```

**Notification / Task Item:**
```
Height:             52px
Left:               16px icon in colored gradient container (40px, 8px radius)
Content:            Title body-md Carbon Black · subtitle body-sm Mid Gray
Right:              Timestamp label · optional action icon
Hover:              bg Cyan Tint, left border 2px Vivid Cyan, transition 100ms
Unread indicator:   6px Electric Cyan dot, left edge + subtle glow
Read state:         title weight 400 (vs 600 unread)
New notification:   Spring-slides in from top, haptic: DOUBLE
```

---

### 13.9 Dashboard Animation Patterns

Dashboard animations must be **instant and reactive** — data feels live, the interface never makes users wait.

```
KPI counter on load:     Count up from 0, 900ms ease-out, starts 150ms after mount
                         At completion: brief scale(1.06) spring + cyan glow flash
Chart draw on load:      400–700ms, staggered per series
Card mount stagger:      30ms between bento cards
Row hover transition:    80ms — absolutely must feel instant
Sidebar expand/collapse: 220ms ease-in-out + haptic: TICK
Tooltip appear:          120ms fade-in
Skeleton → content:      Cross-fade 180ms
Notification badge pop:  scale(0) → scale(1.3) → scale(1), 250ms bounce ease
                         + haptic: DOUBLE
Real-time data update:   Number flips with 150ms ease
                         Row highlights Electric Cyan for 800ms then fades
Match found event:       Card slides in from right (350ms spring)
                         Border pulses cyan 3× · haptic: SUCCESS
```

**Sidebar collapse:**
```
Width: 240px → 72px, 220ms ease-in-out
Nav labels: opacity 1 → 0, 120ms (leads the width)
Icon: nudges to center, 220ms
Tooltip: appears after 350ms hover delay on collapsed icons
```

---

### 13.10 Master-Detail Split Panel (New in v2.0)

The master-detail pattern is used on the **Matches** page and any view where selecting an item from a list or grid should reveal full detail without a full page navigation. It keeps context visible and makes the interface feel fast and contained.

**Layout structure:**
```
┌──────────────────────────────────┬─────────────────┐
│                                  │                 │
│   Master panel (left)            │  Detail panel   │
│   Card grid or list              │  (right, fixed) │
│   — filter bar at top            │                 │
│   — scrollable                   │  380–420px wide │
│                                  │  — not scroll   │
│                                  │    linked to    │
│                                  │    master       │
└──────────────────────────────────┴─────────────────┘

Grid split:       grid-template-columns: 1fr 380px  (desktop ≥ 1280px)
                  grid-template-columns: 1fr 340px  (desktop 1024–1280px)
                  Single column, detail opens as drawer (mobile / tablet < 1024px)
```

**Master panel:**
```
Background:       Page background (cyan-blue gradient)
Padding:          24px 24px 24px 32px
Overflow:         scroll-y, hidden-x
Filter bar:       Sticky at top of master panel, not full-page sticky
Card grid:        auto-fill columns, minmax(260px, 1fr), gap 16px
Result count:     Above grid, body-sm, Mid Gray · bold count in Carbon Black
```

**Detail panel:**
```
Background:       White
Border-left:      1px solid rgba(6,182,212,0.12)
Width:            Fixed — does not resize
Overflow:         scroll-y independently of master

Detail hero (top section of panel)
  Background:     Dark gradient — linear-gradient(160deg, #06101E 0%, #0D2A4A 100%)
                  + radial cyan/blue aurora overlay
  Content:        Company logo (64px) · name · tagline · match score badge · tags
  Logo:           64px × 64px, border-radius 16px, gradient fill, cyan border glow
  Score display:  Large pill — bg rgba(0,212,255,0.12), border rgba(0,212,255,0.25)
                  Score number: 28px, Sora 800, Electric Cyan, text glow
                  Label "match": 13px, rgba(white,0.5)

Detail body (scrollable below hero)
  Padding:        24px 28px
  Sections:       Key Metrics grid · Company Info rows · Compatibility bars · Actions
  Section title:  11px, weight 700, letter-spacing 0.10em, ALL CAPS, Mid Gray

Key metrics grid
  Layout:         2×2 grid, 10px gap
  Each cell:      Pale Blue Tint bg · 12px radius · value (Sora 22px 800) + label (11px Mid Gray)
  Hover:          bg → Cyan Tint · border rgba(6,182,212,0.25)

Company info rows
  Each row:       48px, flex, icon (14px Vivid Cyan) + body text (13px Ink Gray)
  Background:     Pale Blue Tint · 8px radius
  Hover:          bg → Cyan Tint

Compatibility breakdown bars
  One bar per factor (e.g. Business Model Fit, Market Alignment, Stage Match)
  Label left · percentage right (Vivid Cyan, 12px 600)
  Track: 5px, Light Border · Fill: brand gradient
  Animation: width grows from 0 on panel open, 800ms ease-out, staggered 80ms

Action buttons (pinned to bottom of panel or bottom of body content)
  Primary:        Full-width, gradient brand button, "Connect with [Company]"
  Secondary:      Full-width, ghost cyan, "Schedule Intro Call"
  Gap:            10px between buttons
```

**Panel open/close behaviour:**
```
On card select:
  Detail panel is always visible on desktop — content cross-fades on selection
  Cross-fade: 180ms ease · new content fades in after old fades out (not simultaneous)
  Haptic: MEDIUM fires on card click

On mobile / tablet (< 1024px):
  Detail panel slides up as a full-screen bottom drawer
  Backdrop: rgba(0,0,0,0.40), tap to dismiss
  Drawer entry: translateY(100%) → translateY(0), 350ms cubic-bezier(0.34,1.56,0.64,1)
  Drawer exit: translateY(0) → translateY(100%), 250ms ease-in

Empty / no selection state (desktop):
  Show a centered placeholder in the detail panel
  Icon: 48px connection icon, Mid Gray
  Text: "Select a match to view details", body-sm, Mid Gray
  No border, no shadow — very quiet
```

---

### 13.12 Dashboard Dark Mode

```
Page background:    #0A1628  (deep navy)
                    + aurora gradient overlay (very subtle cyan/teal radials)
Surface cards:      rgba(255,255,255,0.05) glass
                    border: 1px solid rgba(0,212,255,0.12)
Sidebar:            #06101E
Text primary:       #FFFFFF
Text secondary:     rgba(255,255,255,0.55)
Dividers:           rgba(0,212,255,0.10)
Primary action:     Electric Cyan (#00D4FF) in dark mode (replaces Calm Blue)
Charts:             Vivid Cyan fills pop beautifully on dark background
Input fields:       bg rgba(255,255,255,0.06) · border rgba(0,212,255,0.18)
                    focus: border Electric Cyan + 0 0 0 3px rgba(0,212,255,0.15)
```

---

### 13.13 Dashboard Responsive Behaviour

| Breakpoint | Sidebar | Content |
|-----------|---------|---------|
| > 1280px | 240px expanded | Full bento grid |
| 1024–1280px | 72px collapsed (icon only) | 2–3 column bento |
| 768–1024px | Hidden, hamburger trigger | 2-column grid |
| < 768px | Bottom tab bar (5 items max) with cyan active indicator | Single column stack |

---

## 14. Responsive Behavior

| Breakpoint | Width | Notes |
|-----------|-------|-------|
| Mobile | < 640px | Single column, stacked layouts, bottom nav |
| Tablet | 640–1024px | 2-column grids, reduced padding, hamburger menu |
| Desktop | 1024–1280px | Full layout, standard spacing |
| Wide | > 1280px | Content capped at 1280px, centered |

- Cards collapse from 3-col → 2-col → 1-col
- Hero heading scales from 72px → 48px → 36px
- Navbar collapses to hamburger below 1024px
- Touch targets minimum 44×44px on mobile
- Haptic feedback fully active on mobile
- No horizontal scroll on any viewport

---

## 15. Dos & Don'ts

### Do
- Use **Vivid Cyan (#06B6D4)** for hover states and interactive emphasis — it creates electric pop
- Use **Electric Cyan (#00D4FF) glows** on dark surfaces for depth and premium feel
- Use **Teal (#14B8A6)** for success states, match confirmations, and positive delta indicators
- Keep **ample white/negative space** — the design should breathe even with electric accents
- Trigger **haptic feedback** on every meaningful action — makes mobile feel native and premium
- Use **spring easing** for interactive elements — it makes everything feel snappy and physical
- **Ripple every click** — the 400ms cyan ripple makes users feel heard

### Don't
- Don't use Electric Cyan for body text — it's an accent, not a reading color
- Don't use cyan glows on light white backgrounds — reserve glows for dark/glass surfaces
- Don't use more than 3 font weights in a single section
- Don't stack multiple cyan/teal tones without sufficient contrast
- Don't use box shadows on dark backgrounds — use glows instead
- Don't animate elements the user isn't looking at — trigger on viewport entry
- Don't make hover effects slower than 200ms — snappiness is non-negotiable
- Don't introduce colors outside this palette without a design review

---

## 16. Brand Voice in UI Copy

- **Tone:** Confident, professional, human — not corporate jargon
- **CTA copy:** Action-first. "Find Your Match", "Start Connecting", "Explore Partners" — not "Submit" or "Click Here"
- **Error messages:** Helpful and calm, not alarming
- **Empty states:** Encouraging — guide the user toward next action
- **Numbers:** Always formatted with commas (1,200+), suffixes (98%), or units ($4M)

---

*PDS Connect Branding Guidelines v2.0 — For internal design and development use.*
*Questions or proposals for updates: design@pdsconnect.com*
