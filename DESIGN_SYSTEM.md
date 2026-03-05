# ORDVORD - Game Studio Design System
## Professional Design Specification v2.0

---

## 🎯 Design Philosophy

**Core Pillars:**
1. **Premium Feel** - Every interaction should feel expensive and polished
2. **Game Juice** - Maximize feedback, minimize friction
3. **Bitcoin Native** - Orange is our brand, inscriptions are our soul
4. **Competitive Spirit** - Channel Pokemon, MTG, and modern TCG UX
5. **Performance First** - 60fps animations, instant feedback

**References:**
- Pokemon (Gen 4-9) - Card design, battle UI, HP bars
- Hearthstone - Premium card reveals, golden animations
- Teamfight Tactics - Hex board aesthetics, unit glow
- Valorant - Clean UI, premium button feedback
- Bitcoin Ordinals - Inscription-first design

---

## 🎨 Color System

### Primary Palette
```css
--bitcoin-orange-50:  #fff7ed;
--bitcoin-orange-100: #ffedd5;
--bitcoin-orange-200: #fed7aa;
--bitcoin-orange-300: #fdba74;
--bitcoin-orange-400: #fb923c;
--bitcoin-orange-500: #f7931a;  /* PRIMARY */
--bitcoin-orange-600: #ea7d10;
--bitcoin-orange-700: #c27515;
--bitcoin-orange-800: #9a5c14;
--bitcoin-orange-900: #7c4a15;
```

### Element Type Colors
```css
--element-fire:      #ff6b2c;  /* Bright red-orange */
--element-water:     #3b9dff;  /* Cyan blue */
--element-electric:  #ffd93d;  /* Lightning yellow */
--element-shadow:    #7d5ba6;  /* Purple darkness */
--element-ice:       #6dd5ed;  /* Frost cyan */
--element-gold:      #d4af37;  /* Metallic gold */
--element-void:      #10b981;  /* Emerald green */
```

### Rarity Gradients
```css
--rarity-legendary: linear-gradient(135deg, #ffd700 0%, #ffaa00 50%, #ff8c00 100%);
--rarity-epic:      linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%);
--rarity-rare:      linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #0ea5e9 100%);
--rarity-uncommon:  linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%);
--rarity-common:    linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%);
```

### UI Neutrals
```css
--void-black:    #0a0a12;
--deep-dark:     #12121c;
--card-surface:  #1a1a2e;
--glass-surface: rgba(26, 26, 46, 0.7);
--border-subtle: rgba(255, 255, 255, 0.08);
--border-medium: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.20);
--text-primary:  #e8eef7;
--text-secondary:#94a3b8;
--text-tertiary: #64748b;
--text-disabled: #475569;
```

### Semantic Colors
```css
--success:   #22c55e;
--warning:   #f59e0b;
--error:     #ef4444;
--info:      #06b6d4;
--hp-full:   #22c55e;
--hp-medium: #f59e0b;
--hp-low:    #ef4444;
```

---

## 📐 Spacing System

**Base Unit: 4px**

```css
--space-1:  4px;   /* 0.25rem */
--space-2:  8px;   /* 0.5rem */
--space-3:  12px;  /* 0.75rem */
--space-4:  16px;  /* 1rem */
--space-5:  20px;  /* 1.25rem */
--space-6:  24px;  /* 1.5rem */
--space-8:  32px;  /* 2rem */
--space-10: 40px;  /* 2.5rem */
--space-12: 48px;  /* 3rem */
--space-16: 64px;  /* 4rem */
--space-20: 80px;  /* 5rem */
--space-24: 96px;  /* 6rem */
```

**Component Spacing:**
- Cards: `--space-6` (24px) padding
- Buttons: `--space-4` vertical, `--space-8` horizontal
- Sections: `--space-12` to `--space-16` vertical spacing
- Page margins: `--space-6` mobile, `--space-12` desktop

---

## 🔤 Typography

### Font Stack
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", sans-serif;
--font-mono: "SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace;
--font-display: "Inter", -apple-system, sans-serif; /* Tight tracking for titles */
```

### Type Scale
```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
--text-8xl:  6rem;      /* 96px */
```

### Font Weights
```css
--weight-normal:    400;
--weight-medium:    500;
--weight-semibold:  600;
--weight-bold:      700;
--weight-extrabold: 800;
--weight-black:     900;
```

### Line Heights
```css
--leading-tight:  1.25;
--leading-snug:   1.375;
--leading-normal: 1.5;
--leading-relaxed:1.625;
--leading-loose:  2;
```

### Letter Spacing
```css
--tracking-tighter: -0.05em;
--tracking-tight:   -0.025em;
--tracking-normal:  0em;
--tracking-wide:    0.025em;
--tracking-wider:   0.05em;
--tracking-widest:  0.1em;
```

---

## 🎬 Animation System

### Timing Functions
```css
--ease-out:       cubic-bezier(0.4, 0, 0.2, 1);
--ease-in:        cubic-bezier(0.4, 0, 1, 1);
--ease-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:    cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275);
--ease-elastic:   cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Scale
```css
--duration-instant: 100ms;
--duration-fast:    200ms;
--duration-normal:  300ms;
--duration-slow:    500ms;
--duration-slower:  700ms;
--duration-slowest: 1000ms;
```

### Animation Patterns

**Micro-interactions** (hover, click):
- Duration: 200ms
- Easing: ease-out
- Properties: transform, opacity, box-shadow

**Entrance animations**:
- Duration: 300-500ms
- Easing: ease-bounce or ease-spring
- Stagger: 50-100ms between elements

**Exit animations**:
- Duration: 200-300ms
- Easing: ease-in
- Keep exit faster than entrance

**Game feedback** (damage, effects):
- Duration: 800-1200ms
- Easing: ease-out
- Use scale + opacity + position

---

## 🎴 Component Library

### 1. Fighter Cards

**Three Variants:**

#### A. Grid Card (Select Screen)
```
┌─────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Rarity stripe (2px)
│                     │
│      [EMOJI/IMG]    │ ← 100px height
│         OR          │
│    [INSCRIPTION]    │
│                     │
├─────────────────────┤
│ Name         [TYPE] │
│ #12345              │
│ [RARITY BADGE]      │
│                     │
│ ATK ████████▒▒ 85   │
│ DEF ███████▒▒▒ 70   │
│ SPD ████████▒▒ 82   │
└─────────────────────┘
```

**Specs:**
- Width: 220px
- Aspect ratio: 3:4
- Border radius: 16px
- Hover: lift 6px, scale 1.02, glow appears
- Selected: gold border, persistent glow
- Legendary: animated gold border shimmer

#### B. Detail Card (Preview Panel)
```
┌────────────────────────────┐
│                            │
│       [LARGE FIGHTER]      │
│         240x240            │
│                            │
├────────────────────────────┤
│ Name                       │
│ #12345                     │
│ [RARITY] [TYPE]           │
│                            │
│ ─ STATS ─                 │
│ HP  ███████████ 95/100    │
│ ATK ████████▒▒▒ 85        │
│ DEF ███████▒▒▒▒ 72        │
│ SPD █████████▒▒ 88        │
│                            │
│ ⚡ SPECIAL MOVE            │
│ Death Strike               │
│ Deal 40 damage + drain    │
│                            │
│ [GO TO BATTLE BUTTON]     │
└────────────────────────────┘
```

**Specs:**
- Width: 360px (desktop), 100% (mobile)
- Padding: 32px
- Glass background
- Slide in from right (400ms, ease-spring)

#### C. Battle Card (Arena)
```
┌───────────────┐
│   [FIGHTER]   │
│    180x180    │
│               │
│   [NAME]      │
└───────────────┘
```

**Specs:**
- Float animation (gentle, 4s loop)
- Shake on hit (500ms, multi-axis)
- Glow pulse during turn (2s loop)
- Scale 1.05 on special move

---

### 2. HP Bars

**Pokemon-style implementation:**

```
┌──────────────────────────────────┐
│ Name              HP: 85/120     │
│ ████████████████▒▒▒▒▒▒  71%     │
│                                  │
└──────────────────────────────────┘
```

**Specs:**
- Height: 16px (bar), 24px (total with label)
- Border radius: 8px
- Inner gradient: shimmer effect
- Transition: 500ms ease-out
- Critical flash: <25% HP, pulse red

**Color transitions:**
- 75-100%: #22c55e (Green)
- 50-75%:  #f59e0b (Yellow)
- 25-50%:  #fb923c (Orange)
- 0-25%:   #ef4444 (Red + flash)

---

### 3. Buttons

#### Primary CTA
```css
.btn-primary {
  padding: 16px 48px;
  font-weight: 800;
  letter-spacing: 0.1em;
  background: linear-gradient(135deg, #f7931a, #d97706);
  box-shadow: 0 0 30px rgba(247, 147, 26, 0.5);
  clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
  transition: all 300ms ease-bounce;
}

.btn-primary:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 0 50px rgba(247, 147, 26, 0.8);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

#### Secondary Button
```css
.btn-secondary {
  padding: 12px 32px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(247, 147, 26, 0.3);
  backdrop-filter: blur(8px);
  transition: all 200ms ease-out;
}

.btn-secondary:hover {
  background: rgba(247, 147, 26, 0.1);
  border-color: #f7931a;
}
```

---

### 4. Type Badges

```html
<span class="type-badge type-fire">
  🔥 FIRE
</span>
```

**Specs:**
- Padding: 6px 14px
- Border radius: 999px
- Font size: 0.75rem
- Font weight: 700
- Text transform: uppercase
- Letter spacing: 0.05em
- Box shadow: 0 2px 8px rgba(0,0,0,0.3)
- Border: 1px solid rgba(255,255,255,0.2)

---

### 5. Stat Bars

```
ATK ████████▒▒▒▒▒ 82
```

**Specs:**
- Label: 40px width, 0.75rem, bold, uppercase
- Bar background: rgba(0,0,0,0.4)
- Bar fill: gradient based on stat type
- Height: 8px
- Border radius: 4px
- Transition: 800ms ease-out
- Value: 32px width, right-aligned, 0.875rem, bold

---

## 🎮 Page-Specific Patterns

### Landing Page

**Layout:**
```
┌─────────────────────────────────┐
│          [WALLET BTN]           │ Top right
│                                 │
│         ORDVORD                 │ Giant glitch title
│    Bitcoin Battle Arena         │
│                                 │
│  [STATS] [STATS] [STATS]       │ Glass cards
│                                 │
│    [ENTER ARENA BUTTON]        │ Primary CTA
│                                 │
│ [12 FIGHTER EMOJIS IN GRID]    │ Glass containers
│                                 │
│  [FEATURE] [FEATURE] [FEATURE] │
└─────────────────────────────────┘
```

**Particle System:**
- 32 particles (up from 24)
- Types: Embers, sparks, dust motes
- 3 size variations (2px, 3px, 4px)
- Randomized float patterns
- Mouse-reactive (parallax on movement)

---

### Select Screen

**Layout:**
```
┌────────────────────────────────────────┐
│ [←BACK]      Season 03 · Round 1  [⚙️] │
│                                        │
│       CHOOSE YOUR FIGHTER              │
│    "8 inscriptions in your wallet"    │
│                                        │
├─────────────┬──────────────────────────┤
│             │                          │
│ [CARD GRID] │  [PREVIEW PANEL]        │
│ 4 columns   │  - Large fighter        │
│             │  - Stats                │
│ [CARD]      │  - Special move         │
│ [CARD]      │  - Actions              │
│ [CARD]      │                          │
│ ...         │                          │
│             │                          │
└─────────────┴──────────────────────────┘
```

**Interactions:**
- Card hover: lift + glow
- Card click: select (golden border)
- Preview slide-in: 400ms spring
- Stagger grid entrance: 50ms per card

---

### Battle Screen

**Layout:**
```
┌─────────────────────────────────────────┐
│ [YOUR HP BAR]  ROUND 3  [ENEMY HP BAR] │
│     85/100               62/95         │
├─────────────────────────────────────────┤
│                                         │
│    [YOUR FIGHTER]  VS  [ENEMY]         │
│        ↓ Glow          ↓ Shake         │
│                                         │
│         [DAMAGE NUMBERS FLOAT]          │
│                                         │
├──────────────┬──────────────────────────┤
│              │ [STRIKE] [POWER]        │
│ [BATTLE LOG] │ [DEFEND] [SPECIAL]      │
│              │                          │
└──────────────┴──────────────────────────┘
```

**Combat Juice:**
- Damage number: scale 1→1.3→0.8, float -80px, fade out
- Hit shake: 500ms, multi-axis (±10px, ±2deg rotation)
- Attack flash: brightness(1.5) for 200ms
- Turn glow: 2s pulse on active fighter
- HP bar: 500ms smooth fill, shimmer overlay

---

### Result Screen

**Victory Layout:**
```
┌──────────────────────────────┐
│                              │
│       🏆 VICTORY! 🏆         │
│                              │
│  [CONFETTI ANIMATION]        │
│                              │
│  [YOU: BURNED]  [OPP: BURNED]│
│                              │
│      +625 SATS CLAIMED       │
│                              │
│  [FIGHT AGAIN] [MAIN MENU]  │
│                              │
└──────────────────────────────┘
```

**Defeat Layout:**
```
┌──────────────────────────────┐
│                              │
│       ☠️ DEFEATED ☠️         │
│                              │
│  [DUST PARTICLES]            │
│                              │
│  [YOU: BURNED]  [OPP: BURNED]│
│                              │
│   YOUR ORDINAL WAS BURNED    │
│   Opponent claimed 625 sats  │
│                              │
│  [TRY AGAIN] [MAIN MENU]    │
│                              │
└──────────────────────────────┘
```

**Effects:**
- Victory: Gold confetti (50 pieces), celebration particles
- Defeat: Red dust particles, screen desaturate
- Both fighters: grayscale + "BURNED" overlay
- Entrance: Spring bounce (600ms)
- Stat comparison: Slide in from sides (400ms)

---

## ⚡ Performance Budget

### FPS Targets:
- **60fps** - All animations, scrolling
- **30fps minimum** - Mobile devices
- **16.67ms** - Frame budget

### Animation Limits:
- Max simultaneous animations: 8
- Particle count: 32 (landing), 16 (battle)
- Transform/opacity only (GPU accelerated)
- Will-change hints for active elements
- Disable particles on low-end devices

### Loading:
- First contentful paint: <1s
- Time to interactive: <2s
- Images: WebP, lazy load, blur-up placeholder

---

## ♿ Accessibility

### Keyboard Navigation:
- All buttons: tab-able, Enter/Space to activate
- Focus visible: 3px orange outline, 4px offset
- Skip links for screen readers
- Arrow keys for card navigation

### Screen Readers:
- ARIA labels on all interactive elements
- Live regions for battle updates
- Hidden text for icon-only buttons
- Semantic HTML structure

### Reduced Motion:
- Respect `prefers-reduced-motion`
- Disable: particles, shakes, floating
- Keep: opacity transitions, instant moves
- Alternative: crossfade instead of slide

### Color Contrast:
- WCAG AA minimum (4.5:1 text)
- AAA preferred (7:1 large text)
- Never rely on color alone
- Test with color blindness simulators

---

## 📱 Responsive Breakpoints

```css
--breakpoint-sm:  640px;   /* Mobile landscape */
--breakpoint-md:  768px;   /* Tablet portrait */
--breakpoint-lg:  1024px;  /* Tablet landscape */
--breakpoint-xl:  1280px;  /* Desktop */
--breakpoint-2xl: 1536px;  /* Large desktop */
```

**Mobile-First:**
- Base styles for mobile (320px+)
- Progressive enhancement at breakpoints
- Touch targets: 44px minimum
- Gestures: swipe for navigation where appropriate

---

## 🎯 Quality Checklist

Before shipping any component:

- [ ] Matches design spec pixel-perfect
- [ ] Hover states on all interactive elements
- [ ] Loading states for async actions
- [ ] Error states with clear messaging
- [ ] Empty states that educate
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Reduced motion support
- [ ] 60fps animations
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Performance profiled (no jank)

---

## 🔧 Implementation Notes

### CSS Variables:
Store all tokens as CSS custom properties in `:root`.

### Component Props:
```typescript
interface FighterCardProps {
  fighter: Ordinal;
  variant: 'grid' | 'detail' | 'battle';
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
}
```

### Animation Library:
Use Framer Motion for:
- Complex sequences
- Layout animations
- Gesture handling

Use CSS for:
- Micro-interactions
- Hover states
- Simple loops

---

## 🎨 Next: Component Implementation

Now that we have the design system, we'll rebuild:

1. **Component primitives** (buttons, badges, bars)
2. **Fighter cards** (all three variants)
3. **Page layouts** (landing, select, battle, result)
4. **Particle systems** (embers, sparks, confetti)
5. **Combat effects** (damage numbers, shakes, flashes)
6. **Polish pass** (sounds, haptics, micro-animations)

**Estimated time:** 6-8 hours of focused work.

---

*Last updated: March 4, 2026 - Design System v2.0*
