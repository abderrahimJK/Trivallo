# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Trivallo
**Generated:** 2026-11-20 22:23:20
**Category:** Travel/Tourism Agency
**Token files:** `tokens.json` (W3C Design Tokens Community Group JSON).
**CSS variables:** `tokens.css` (`:root` custom properties).
Token files are master-level only; `--page` overrides do not emit tokens.
**Design Dials:** Variance 7/10 (Balanced / Modern) | Motion 4/10 (Standard) | Density 3/10 (Spacious)

---

## Project Decisions (Trivallo)

These were made on top of the generated output and win over anything below.

- **Concept: "Aurora over the dunes".** The Aurora UI blue-orange pair reads as Majorelle blue
  (Marrakech) meeting a Sahara sunset. Hero bands use a slow mesh gradient of primary, secondary
  and accent with a layered dune silhouette.
- **Storytelling landing:** home page chapters follow the trip, 01 Marrakech, 02 Ouarzazate,
  03 Merzouga, each with its own chapter color (building intensity toward sunset), a mini CTA,
  and a final climax CTA.
  - Marrakech `#BE123C` (Red City), Ouarzazate `#B45309` (kasbah ochre), Merzouga `#C2410C` (dune).
  - White text on all three passes 4.5:1.
- **Text color rules:** `--color-primary` and `--color-accent` are never used for body text on
  light backgrounds (contrast below 4.5:1). Links and text use `--color-foreground`; buttons use
  the documented on-colors (`on-primary`, `on-accent`).
- **Motion:** CSS only (no GSAP dependency): 400ms staggered fade-up on card grids, 200-250ms
  hovers, 12s aurora loop. Everything is disabled under `prefers-reduced-motion`.
- **Images:** `NgOptimizedImage` with `fill`; gradient placeholder in the chapter color when an
  activity has no photo yet. Real, non-generic photography is required before launch (anti-pattern:
  generic photos).

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0EA5E9` | `--color-primary` |
| On Primary | `#0F172A` | `--color-on-primary` |
| Secondary | `#38BDF8` | `--color-secondary` |
| On Secondary | `#0F172A` | `--color-on-secondary` |
| Accent/CTA | `#EA580C` | `--color-accent` |
| On Accent/CTA | `#000000` | `--color-on-accent` |
| Background | `#F0F9FF` | `--color-background` |
| Foreground | `#0C4A6E` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#0C4A6E` | `--color-card-foreground` |
| Muted | `#E8F2F8` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#BAE6FD` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#000000` | `--color-ring` |

**Color Notes:** Sky blue + adventure orange [Accent adjusted from #F97316]

### Typography

> **Project decision (overrides the generated pairing):** the `--design-system` run matched
> "Noto Sans Thai", a pairing for Thai-language sites, which does not fit an EN/FR Morocco
> product. Replaced after a supplementary `--domain typography` search ("adventure bold expressive")
> with the **Bold Statement** pairing: poster-style display type for a travel brand.

- **Heading Font:** Bebas Neue (display only: hero, section and city titles; always uppercase by design)
- **Body Font:** Source Sans 3 (body, UI, card and activity titles at 600-700)
- **Mood:** bold, impactful, dramatic, modern, headlines (travel-poster feel)
- **Google Fonts:** [Bebas Neue + Source Sans 3](https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@400;600;700&display=swap)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Sans+3:wght@400;600;700&display=swap');
```

### Spacing Variables

*Density: 3/10 — Spacious*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `24px` / `1.5rem` | Standard padding |
| `--space-lg` | `32px` / `2rem` | Section padding |
| `--space-xl` | `48px` / `3rem` | Large gaps |
| `--space-2xl` | `64px` / `4rem` | Section margins |
| `--space-3xl` | `96px` / `6rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #EA580C;
  color: #000000;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0C4A6E;
  border: 2px solid #0EA5E9;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F0F9FF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0EA5E9;
  outline: none;
  box-shadow: 0 0 0 3px #0EA5E920;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Aurora UI

**Keywords:** Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous, atmospheric, abstract

**Best For:** Modern SaaS, creative agencies, branding, music platforms, lifestyle, premium products, hero sections

**Key Effects:** Large flowing CSS/SVG gradients, subtle 8-12s animations, depth via color layering, smooth morph

### Page Pattern

**Pattern Name:** Scroll-Triggered Storytelling

- **Conversion Strategy:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger; Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Generic photos
- ❌ Complex booking

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
