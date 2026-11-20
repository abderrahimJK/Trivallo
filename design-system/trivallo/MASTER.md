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

**Revision 2 (2026-11-20): "Clean destination guide".** The first direction ("Aurora over the
dunes": dark mesh-gradient heroes, Bebas Neue posters, storytelling chapters) was rejected by the
product owner as still not good. The owner pointed at a leading small-group tour operator's
destination pages as the reference for *structure and feel*. We take the patterns, not the brand,
copy or assets:

- **Feel:** white pages, near-black text, generous whitespace, photography does the talking.
  One brand blue (Majorelle, `#1D4ED8`) for links and secondary actions, one terracotta CTA
  (`#C2410C`) for the action that matters on each screen. No gradient decoration.
- **Destination page pattern** (city pages and the all-trips page):
  breadcrumb > title + intro > wide hero image > "Our {city} trips" with a horizontal
  "Refine search" bar > list of trip cards > short FAQ.
- **Trip card = key facts at a glance:** image, title, "duration · city" line, type and
  category tags, and a price column ("From €X per adult" + "View trip"). Horizontal row on
  tablet and up, stacked on phones. A compact grid variant is used on the home page.
- **Home:** search hero, value props, "Where you can go" destination tiles, popular trips,
  how it works, FAQ.
- **Activity detail:** breadcrumb, title, tags, key-facts strip (duration, group size, days,
  type), gallery, content sections, sticky price box (mobile: fixed bottom bar).
- **City colors** (`shared/ui/city-chapter.ts`) now only tint image placeholders.
- **Images:** `NgOptimizedImage` with `fill`. This layout depends on real photography: placeholders
  are a stopgap until admin image upload ships (anti-pattern: generic stock photos).
- **Motion:** CSS only, 150-250ms hover transitions, image zoom on card hover; nothing
  decorative. All disabled under `prefers-reduced-motion`.
- **Contrast:** foreground 17.4:1, muted-foreground 7.6:1, primary 6.7:1 and accent 5.2:1 on
  white; white on primary 6.7:1 and on accent 5.2:1.

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#1D4ED8` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#DBEAFE` | `--color-secondary` |
| On Secondary | `#1E3A8A` | `--color-on-secondary` |
| Accent/CTA | `#C2410C` | `--color-accent` |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` |
| Background | `#FFFFFF` | `--color-background` |
| Foreground | `#1C1917` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#1C1917` | `--color-card-foreground` |
| Muted | `#F5F5F4` | `--color-muted` |
| Muted Foreground | `#57534E` | `--color-muted-foreground` |
| Border | `#E7E5E4` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#1D4ED8` | `--color-ring` |

**Color Notes:** Revision 2: Majorelle blue for links and secondary actions, terracotta for the main CTA, neutrals for everything else.

### Typography

> **Project decision (revision 2):** one family, **Inter** (400-800). Headings are Inter 700-800
> with tight tracking, sentence case. Clean, legible, and lets photos lead. The generated run
> suggested Inter / Playfair Display; the serif was dropped to keep the UI calm.

- **Heading Font:** Inter 700-800
- **Body Font:** Inter 400-600
- **Google Fonts:** [Inter](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap)

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

**Style:** Clean destination guide (revision 2; generated: Aurora UI, rejected)

**Keywords:** Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous, atmospheric, abstract

**Best For:** Modern SaaS, creative agencies, branding, music platforms, lifestyle, premium products, hero sections

**Key Effects:** Large flowing CSS/SVG gradients, subtle 8-12s animations, depth via color layering, smooth morph

### Page Pattern

**Pattern Name:** Destination page with filterable trip list (revision 2; generated: Scroll-Triggered Storytelling, rejected)

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
