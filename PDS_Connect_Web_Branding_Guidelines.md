# PDS Connect — Web Branding Guidelines
**Version 1.0 · March 2026**

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

PDS Connect is a professional business matching platform built on trust, clarity, and intelligent connection. The visual identity reflects **calm authority** — approachable yet sophisticated, structured yet dynamic. Every design decision reinforces the brand promise: connecting the right businesses, effortlessly.

**Design Pillars:**
- **Clarity** — Information is easy to find, easy to read, easy to act on
- **Confidence** — Layouts feel stable and trustworthy, never cluttered
- **Connection** — Interactions feel alive and responsive, reflecting the platform's core purpose
- **Calm Motion** — Animations are purposeful and subtle, never distracting

---

## 3. Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Sky Blue | `#5BABF0` | `91, 171, 240` | Primary CTAs, highlights, active states |
| Calm Blue | `#2E7FD9` | `46, 127, 217` | Headers, links, primary nav, section accents |
| Deep Blue | `#1A5FAA` | `26, 95, 170` | Hover states on primary buttons, footer anchors |
| Off-White | `#F5F8FC` | `245, 248, 252` | Page backgrounds, card surfaces |
| Pure White | `#FFFFFF` | `255, 255, 255` | Text on dark/blue backgrounds, card content |

### Counter & Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Carbon Black | `#0D0D0D` | `13, 13, 13` | Strong headings on white, counter-color sections |
| Ink Gray | `#3A3A3A` | `58, 58, 58` | Body text, subheadings on light backgrounds |
| Mid Gray | `#8A8A8A` | `138, 138, 138` | Secondary text, placeholders, captions |
| Light Border | `#D8E6F5` | `216, 230, 245` | Dividers, card borders, input outlines |
| Pale Blue Tint | `#EEF5FC` | `238, 245, 252` | Section alternates, feature card backgrounds |

### Color Usage Principles

**Dark sections (hero, feature callouts):**
- Background: `Carbon Black (#0D0D0D)` or `Calm Blue (#2E7FD9)`
- Text: `Pure White (#FFFFFF)`
- Accent: `Sky Blue (#5BABF0)`

**Light sections (content, features, cards):**
- Background: `Off-White (#F5F8FC)` or `Pure White`
- Text: `Ink Gray (#3A3A3A)`
- Headings: `Carbon Black (#0D0D0D)`
- Accent: `Calm Blue (#2E7FD9)`

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

**Hero Section:** Full-width, min-height 90vh. Dark overlay or solid Calm Blue background. Large display heading left-aligned or centered. One CTA button primary, one ghost secondary. Optional subtle background illustration or mesh gradient.

**Stats/Counter Bar:** Full-width, Carbon Black or Calm Blue. Large `stat` typography in white. 3–4 metrics separated by subtle vertical dividers. Numbers animate up on scroll-enter.

**Feature Cards Grid:** 3-column grid (desktop). Off-White background section. Cards with white surface, `Light Border` outline, 16px border-radius. Icon top-left in Calm Blue. Heading + body + optional "Learn more →" link.

**Testimonials:** Dark section (Carbon Black). Quote in large italic white type. Author name in Sky Blue. Profile images in circular crop. Horizontal scroll on mobile.

**CTA Banner:** Full-width, Calm Blue background. Centered heading in white. Two buttons (Primary + Ghost). No distractions.

---

## 6. Components

### Buttons

```
Primary Button
  Background:     Calm Blue (#2E7FD9)
  Text:           White
  Border:         none
  Border-radius:  8px
  Padding:        14px 28px
  Font:           label size, weight 600
  Transition:     background 200ms ease, transform 150ms ease
  Hover:          background → Deep Blue (#1A5FAA), translateY(-2px)
  Active:         translateY(0), brightness(0.95)
  Focus:          2px outline offset Sky Blue

Ghost Button
  Background:     transparent
  Text:           Calm Blue (on light) or White (on dark)
  Border:         1.5px solid current text color
  Border-radius:  8px
  Padding:        14px 28px
  Hover:          background → Pale Blue Tint (on light) or rgba(white, 0.1) (on dark)
  Transition:     all 200ms ease

Icon Button (circular)
  Size:           44px × 44px
  Border-radius:  50%
  Background:     Pale Blue Tint
  Icon color:     Calm Blue
  Hover:          background → Light Border, scale(1.08)
```

### Navigation

```
Navbar
  Background:     White (default) → blur backdrop on scroll
  Height:         72px
  Logo:           Left-aligned
  Links:          Ink Gray, font-size 15px, weight 500
  Active link:    Calm Blue, bottom border 2px Calm Blue
  Link hover:     Calm Blue, transition 150ms
  Scroll trigger: Add box-shadow and reduce height to 60px (transition 300ms)
  CTA:            Primary button, right-aligned

Mobile nav:       Full-screen overlay, Carbon Black background, links in white
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
    Shadow:       0 8px 32px rgba(46,127,217, 0.14)
    Transform:    translateY(-4px)
    Border-color: Sky Blue (#5BABF0)
  Transition:     all 250ms ease

Feature Card (with icon)
  As above +
  Icon container: 48px, Pale Blue Tint background, 12px radius
  Icon:           24px, Calm Blue

Profile/Match Card
  Border-radius:  20px
  Top accent bar: 4px Calm Blue gradient → Sky Blue
  Avatar:         64px circle, border 2px Sky Blue
  Match score:    Bold stat text in Calm Blue
  Hover:          Lift + subtle glow in Calm Blue
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
    Border-color:   Calm Blue
    Box-shadow:     0 0 0 3px rgba(46,127,217, 0.15)
  Transition:       border 150ms, box-shadow 150ms

Label:  font-size 14px, weight 600, Carbon Black, margin-bottom 6px
Error:  border-color #E53E3E, helper text in red below
```

### Tags & Badges

```
Industry tag:   Pale Blue Tint bg · Calm Blue text · 6px radius · label size
Status badge:   Filled bg (color-coded) · White text · pill shape (99px radius)
Match score:    Sky Blue bg · White text · bold · pill shape
```

---

## 7. Iconography

- **Style:** Outline icons, 1.5px stroke weight, rounded caps and joins
- **Set:** Lucide Icons or Phosphor Icons (consistent throughout)
- **Sizes:** 16px (inline), 24px (standard UI), 32px (feature highlights), 48px (hero icons)
- **Color:** Inherits from context — Calm Blue on light, White on dark, Sky Blue for emphasis
- **Never** use filled icons and outline icons in the same section

---

## 8. Imagery & Visual Style

### Photography
- **Tone:** Clean, well-lit, professional. Avoid overly staged stock imagery.
- **Color treatment:** Slightly cooled — blue-leaning tones preferred
- **Subjects:** Real professionals, collaborative environments, modern office/city settings
- **Overlay:** When text sits over images, use a `rgba(13,13,13, 0.45)` scrim or `linear-gradient(to right, rgba(26,95,170,0.85), transparent)`

### Illustrations & Graphics
- **Style:** Minimal flat vector or soft 3D blobs/orbs (reference: BloomFi hero)
- **Palette:** Restricted to the brand palette only
- **Background graphics:** Subtle dot grids, soft mesh gradients, or geometric node-line patterns (echoing "connection/network" metaphor)

### Data Visualization
- **Primary color:** Calm Blue / Sky Blue
- **Secondary:** Pale Blue Tint for backgrounds
- **Avoid** red/green-only coding for accessibility
- Charts should use the full blue scale before introducing neutral tones

---

## 9. Animation & Interaction

> All motion follows the principle: **purposeful, subtle, never gratuitous.** Animations exist to guide attention, confirm actions, and make the interface feel alive — not to entertain.

### Timing Tokens

```css
--duration-instant:   100ms    /* State feedback (active press) */
--duration-fast:      150ms    /* Hover transitions, icon swaps */
--duration-base:      250ms    /* Card lifts, button states */
--duration-moderate:  400ms    /* Panel slides, modal entry */
--duration-slow:      600ms    /* Section entrances, hero reveals */
--duration-reveal:    800ms    /* Scroll-triggered content */

--ease-standard:      cubic-bezier(0.4, 0, 0.2, 1)   /* General */
--ease-out:           cubic-bezier(0, 0, 0.2, 1)      /* Entering elements */
--ease-in:            cubic-bezier(0.4, 0, 1, 1)      /* Exiting elements */
--ease-spring:        cubic-bezier(0.34, 1.56, 0.64, 1) /* Playful bounces (use sparingly) */
```

### Scroll-Triggered Animations

**Fade + Rise (default entry):**
```css
Initial:    opacity: 0;  transform: translateY(24px)
Animated:   opacity: 1;  transform: translateY(0)
Duration:   600–800ms · ease-out
Stagger:    80ms between sibling elements
Threshold:  Trigger at 20% element visibility
```

**Counter Number Animation:**
```
Animate from 0 → target value over 1200ms
Easing: ease-out cubic
Trigger: When stat section enters viewport
Format: Include commas/suffixes (1,200+, 95%, etc.)
```

**Horizontal Slide (for testimonials / carousels):**
```
Cards slide in from right: translateX(40px) → translateX(0)
Duration: 400ms · ease-out
```

### Hover Interactions

| Element | Hover Effect |
|---------|-------------|
| Cards | `translateY(-4px)` + shadow deepen + border tint |
| Primary button | `translateY(-2px)` + background deepen |
| Ghost button | Background fill fade-in |
| Nav links | Color shift to Calm Blue + underline scale-in from left |
| Icon buttons | `scale(1.08)` + background fill |
| Images in cards | `scale(1.04)` with `overflow: hidden` on container |
| CTA arrow/icon | `translateX(4px)` on link hover |
| Logo | Subtle `opacity` pulse or scale on hover |

### Navbar Scroll Behavior

```
On scroll Y > 20px:
  - Add: backdrop-filter: blur(16px) saturate(1.5)
  - Background: rgba(255,255,255,0.88)
  - Reduce height: 72px → 60px
  - Add: box-shadow: 0 1px 20px rgba(46,127,217, 0.08)
  Transition: all 300ms ease
```

### Page Transitions

- **Between pages:** Fade-out (200ms) → route change → fade-in content (300ms)
- **Modal / drawer entry:** Slide up from bottom + fade-in, backdrop fades to `rgba(0,0,0,0.4)`
- **Toast notifications:** Slide in from top-right, auto-dismiss with fade-out

### Loading States

```
Skeleton screens:
  Color:      gradient shimmer, Light Border → Pale Blue Tint → Light Border
  Animation:  background-position sweep, 1.5s infinite
  Shape:      Match target element proportions with 8px border-radius

Progress indicator:
  Color:      Calm Blue
  Style:      Thin top-of-page bar (3px height) or circular spinner
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* All transforms and transitions: disable or set to 0ms */
  /* Scroll animations: show immediately at final state */
  /* Counter animations: show final value immediately */
  /* Parallax effects: disable entirely */
}
```
Always implement this media query. Accessibility is non-negotiable.

---

## 10. Spacing & Elevation

### Elevation (Shadow) Scale

```css
--shadow-xs:   0 1px 4px  rgba(46,127,217, 0.04);  /* Resting cards */
--shadow-sm:   0 2px 12px rgba(46,127,217, 0.06);  /* Default card */
--shadow-md:   0 4px 20px rgba(46,127,217, 0.10);  /* Raised elements */
--shadow-lg:   0 8px 32px rgba(46,127,217, 0.14);  /* Hover card */
--shadow-xl:   0 16px 48px rgba(46,127,217, 0.18); /* Modal, floating panels */
--shadow-glow: 0 0 24px  rgba(91,171,240, 0.30);   /* Active/featured items */
```

> Shadow color is always based on Calm Blue — this keeps depth feeling on-brand rather than generic gray.

---

## 11. Section Templates

### Hero Section
```
Background:     Calm Blue (#2E7FD9) or Carbon Black with blue mesh gradient
Layout:         Text left (60%) · Visual right (40%) — or centered
Heading:        display-xl, White
Subheading:     body-lg, rgba(White, 0.80)
CTA group:      Primary button + Ghost button, gap 12px
Animation:      Heading fades + rises (600ms), sub fades (800ms, 100ms delay), CTAs (1000ms, 200ms delay)
Visual:         Product screenshot in card shell with subtle float animation (translateY ±8px, 4s ease-in-out loop)
```

### Stats / Trust Bar
```
Background:     Carbon Black
Layout:         4 stats in a row, centered, dividers between
Number:         stat token, Sky Blue
Label:          label token, Mid Gray
Animation:      Counter animation on viewport entry
```

### Feature Grid
```
Background:     Off-White or White
Intro:          Centered heading (heading-1) + body-lg, max-width 640px
Grid:           3-column (desktop), 2 (tablet), 1 (mobile)
Cards:          Feature cards with icon
Animation:      Staggered fade+rise, 80ms between cards
```

### Testimonials
```
Background:     Carbon Black
Layout:         Single quote, centered, max-width 800px; or horizontal scroll of cards
Quote style:    heading-2, italic, White
Attribution:    Sky Blue name + Mid Gray role
Animation:      Fade in on scroll
```

### CTA Banner
```
Background:     Calm Blue gradient → Deep Blue
Layout:         Centered
Heading:        heading-1, White
Subtext:        body-md, rgba(White, 0.80)
Buttons:        Primary (White text on white bg → inverted) + Ghost white
```

---

## 12. Responsive Behavior

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
- No horizontal scroll on any viewport

---

## 13. Dos & Don'ts

### Do
- Use **Calm Blue** as the dominant brand color across interactive elements
- Keep **ample white space** — the design should breathe
- Use **black sections** strategically as contrast anchors (not more than 2 per page)
- Animate **on entry and on hover** — never auto-looping without user interaction (except subtle hero backgrounds)
- **Test contrast ratios** on every color combination before shipping

### Don't
- Don't use more than 3 font weights in a single section
- Don't stack multiple blue tones without sufficient contrast between them
- Don't use box shadows on dark backgrounds — use glow or no shadow
- Don't animate elements the user isn't looking at — trigger on viewport entry
- Don't use motion for purely decorative reasons — every animation should have a UX rationale
- Don't introduce colors outside this palette without a design review

---

## 14. Brand Voice in UI Copy

- **Tone:** Confident, professional, human — not corporate jargon
- **CTA copy:** Action-first. "Find Your Match", "Start Connecting", "Explore Partners" — not "Submit" or "Click Here"
- **Error messages:** Helpful and calm, not alarming
- **Empty states:** Encouraging — guide the user toward next action
- **Numbers:** Always formatted with commas (1,200+), suffixes (98%), or units ($4M)

---

*PDS Connect Branding Guidelines v1.0 — For internal design and development use.*
*Questions or proposals for updates: design@pdsconnect.com*
