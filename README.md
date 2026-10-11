# hmnsshu

Himanshu K Mahesh's portfolio, built with Next.js (App Router), React 19, TypeScript and plain CSS (global tokens plus CSS Modules). The visual source of truth is the prototype in `../wireframe/`.

```bash
npm run dev        # http://localhost:3000. Press G to toggle the column grid (dev only)
npm run build      # fully static output
npm run lint && npm run typecheck
```

Add `?sky=HH:MM` to the URL to preview the hero sky at any time of day in Bengaluru.

The light bulb in the hero switches between light and dark mode. Dark is the default, and a visitor's choice is saved in localStorage. A script in `<head>` applies it before first paint, and the switch plays as a circular reveal from the bulb (View Transitions API, instant where unsupported).

## Layout

```
app/                  layout (font, nav, footer), homepage, /about, 404, favicon
styles/
  tokens.css          every colour (dark + light), type size, space, radius, duration; grid per breakpoint
  base.css            reset and element defaults
  layout.css          .wrap / .grid / .section: the 4 / 8 / 12 column system
  utilities.css       type roles, .brackets, .hide-m / .show-m, reveal-on-scroll
content/              site facts, intro (startups, ventures + OG images), projects, notes, about: edit copy here
components/
  site/               Nav, Footer, RevealObserver, GridOverlay (dev)
  ui/                 CopyEmailButton, ThemeToggle, Chip, HoverReveal, SectionHead, Media, CropMarks, LocalTime, icons
  home/               Hero (+ SkyHero client shell), SelectedWork, Notes, Contact
  about/              Bento (+ IntroPlayer), Entries (experience, recognition), Gallery
lib/
  grid.ts             place({ m, t, d }) for grid spans, and cx()
  theme.ts            light / dark: boot script, store, circular-reveal switch
  sky/                the hero sky: solar maths, OKLab palettes, renderer, controller
    layers/           atmosphere · night (stars, meteors) · wisps · birds · petals
```

## Conventions

- **Grid.** Children of `.grid` place themselves per breakpoint with `style={place({ m: "1 / 3", t: "1 / 4", d: "1 / 4" })}`. Breakpoints are 768px (8 columns) and 1200px (12 columns).
- **Tokens first.** Components use `var(--…)` from `tokens.css`. A value that belongs to a single component is named at the top of that component's module.
- **Server by default.** Only interactive pieces are client components: Nav, SkyHero, ThemeToggle, CopyEmailButton, LocalTime, RevealObserver, GridOverlay, and on /about IntroPlayer, ClampedText and Gallery.
- **Reveal on scroll.** Add `data-reveal` to an element; one shared observer handles it. With JS disabled or reduced motion on, content is visible.
- **Type & icons.** Body in Zalando Sans SemiExpanded; italic accents and /about section titles in Instrument Serif (`--font-serif`); buttons, chips and keys in Bitcount Grid Single (`--font-button`). Icons are Phosphor duotone, imported per icon (`@phosphor-icons/react/dist/csr/<Name>`, or `/dist/ssr/` in server components) so dev builds stay light.
- **Images.** Set `image` on a project in `content/projects.ts` to replace its gradient cover with a 4:3 image.
