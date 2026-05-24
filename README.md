# Cinderwhisp Hollow

A mobile-first, portrait top-down adventure RPG for Chrome on Android. You play a small fox spirit in an aurora-lit winter forest, gathering six Ember Memories from frozen lanterns and awakening the Old Bear's hearth.

## Features

- Vite + vanilla TypeScript and a procedural HTML5 canvas world; no external sprites or game engine.
- Three stacked biomes: Frostgate, Ravenwood, and Auroral Glen.
- Mobile joystick, contextual Interact button, haptics, Android viewport/safe-area handling, and desktop WASD/arrow/E fallback.
- Sign-in/sign-up loading states plus a logout loading overlay while the session is ending.
- Moving forest characters, animated hollow monsters, and a monster chase loop that tracks the fox spirit.
- 2.5D beveled terrain, depth-sorted procedural actors, tap-to-step world ripples, quest beacon, danger pressure meter, and cinematic canvas overlays for a more immersive game UI.
- Store section for buying and equipping weapons plus persistent power ups with earned coins.
- Supabase Auth, prefixed Postgres tables with RLS, Storage-backed generated PNG sigils, Realtime broadcast ambient foxes, and Postgres-change ember toasts.
- Memory Codex and Awakened hall-of-fame views backed by live Supabase data.

## Setup

1. Apply `supabase/schema.sql` to the Supabase project with a privileged role.
2. Copy `.env.example` to `.env` and fill in the browser-safe Supabase URL, publishable key, and Gogi table prefix.
3. Install and run:

```bash
npm install
npm run dev
```

## Scripts

- `npm run typecheck` — TypeScript checks.
- `npm run lint` — ESLint.
- `npm run build` — production build to `dist/`.
