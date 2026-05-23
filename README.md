# Cinderwhisp Hollow

A mobile-first, portrait top-down adventure RPG for Chrome on Android. You play a small fox spirit in an aurora-lit winter forest, gathering six Ember Memories from frozen lanterns and awakening the Old Bear's hearth.

## Features

- Vite + vanilla TypeScript and a procedural HTML5 canvas world; no external sprites or game engine.
- Three stacked biomes: Frostgate, Ravenwood, and Auroral Glen.
- Mobile joystick, contextual Interact button, haptics, Android viewport/safe-area handling, and desktop WASD/arrow/E fallback.
- Sign-in/sign-up loading states, fightable hollow monsters, and XP-purchased foxfire power.
- Supabase Auth, prefixed Postgres tables with RLS, Storage-backed generated PNG sigils, Realtime broadcast ambient foxes, and Postgres-change ember toasts.
- Memory Codex and Awakened hall-of-fame views backed by live Supabase data.

## Setup

1. Apply `supabase/schema.sql` to the Supabase project with a privileged role.
2. Copy `.env.example` to `.env` and fill in the browser-safe Supabase URL and publishable key.
3. Install and run:

```bash
npm install
npm run dev
```

## Scripts

- `npm run typecheck` — TypeScript checks.
- `npm run lint` — ESLint.
- `npm run build` — production build to `dist/`.
