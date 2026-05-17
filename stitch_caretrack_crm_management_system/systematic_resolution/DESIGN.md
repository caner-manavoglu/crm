---
name: Systematic Resolution
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for high-stakes enterprise environments where clarity, speed of resolution, and institutional trust are paramount. The aesthetic follows a **Corporate Modern** approach with elements of **Minimalism**, prioritizing data density without sacrificing legibility. 

The UI evokes a sense of "Calm Authority"—using deep slate tones to reduce eye strain during long shifts, punctuated by precise, high-contrast functional colors that guide the user's attention to urgent complaints and status changes. Every interaction is designed to feel deliberate, stable, and efficient.

## Colors
The palette is rooted in a deep-sea professional dark mode. 
- **Primary (Corporate Blue):** Used strictly for primary actions, progress indicators, and active selection states.
- **Background (Deep Navy):** Provides the foundational layer of the application, ensuring maximum contrast for white and light-gray text.
- **Surface (Slate):** Distinguishes containers, cards, and modals from the background.
- **Functional Accents:** Alert Orange is reserved for "Pending" or "Escalated" statuses, while Success Green is utilized only for "Resolved" or "Verified" outcomes.
- **Neutral Scale:** Uses the Slate palette to create a clear hierarchy between headlines, body text, and metadata.

## Typography
**Inter** is the sole typeface for this design system, chosen for its exceptional legibility in data-heavy SaaS interfaces and its neutral, systematic character.

- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter-spacing to maintain a compact, authoritative feel.
- **Body:** Regular (400) weight is standard. For long-form complaint descriptions, `body-md` is the primary choice.
- **Labels:** Small caps or slightly tracked-out uppercase `label-md` should be used for table headers and category descriptors to differentiate them from actionable data.
- **Contrast:** Always use #F8FAFC for headlines and #CBD5E1 for body text to ensure WCAG AAA compliance on dark backgrounds.

## Layout & Spacing
The layout employs a **12-column fluid grid** for the main content area, with a fixed sidebar (280px) for global navigation. 

- **Grid:** On desktop, use a 24px gutter. On mobile, transition to a 1-column fluid layout with 16px side margins.
- **Rhythm:** An 8px baseline grid governs all vertical rhythm. Component height increments (Buttons, Inputs) should strictly follow 8px steps (32px, 40px, 48px).
- **Density:** Dashboard views should utilize "Compact" spacing (12px-16px between elements) to maximize information density, while multi-step forms should use "Spacious" padding (32px-40px) to reduce cognitive load during data entry.

## Elevation & Depth
In this professional dark mode, depth is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.

- **Level 0 (Background):** #0F172A - The base canvas.
- **Level 1 (Surface):** #1E293B - Used for the primary card containers and data tables.
- **Level 2 (Raised):** #334155 - Used for hover states, dropdown menus, and nested child elements.
- **Borders:** Every surface container should feature a 1px solid border (#334155). This "ghost border" provides structural definition without visual clutter.
- **Interaction:** On hover, cards should transition their border color to the Primary Accent (#3B82F6) at 40% opacity, rather than increasing shadow spread.

## Shapes
The design system uses a **Rounded (Level 2)** shape language to create a more approachable yet still organized professional interface. This level of curvature provides clear visual containment and a distinct modern feel.

- **Components:** Standard buttons, input fields, and checkboxes use an 8px (0.5rem) radius.
- **Containers:** Dashboard cards and modals use a 16px (1.0rem) radius.
- **Status Badges:** These are the exception, utilizing a fully rounded "Pill" shape to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use a solid #3B82F6 fill with white text. Secondary buttons are outlined (#334155). Avoid gradients; use flat color with subtle opacity shifts on hover.
- **Data Tables:** Use #1E293B for the container. Header rows should have a darker background (#0F172A) and use `label-md` typography. Rows are separated by 1px borders; avoid zebra striping to keep the look clean.
- **Status Badges:** Pill-shaped with a 10% opacity background of the status color (e.g., Green for resolved) and a 100% opacity text label.
- **Timeline Trackers:** A vertical 2px line (#334155) connecting circular nodes. The active node should be Primary Blue with a subtle outer glow (0px 0px 8px).
- **Input Fields:** Darker than the surface (#0F172A), 1px border (#334155), and clear 2px Blue border on focus. Labels are always top-aligned.
- **Multi-step Forms:** Use a horizontal progress stepper at the top with "Line and Circle" indicators. Completed steps should turn Success Green with a checkmark icon.