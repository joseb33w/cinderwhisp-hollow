# Goal
Build Cinderwhisp Hollow as a fresh mobile-first Vite + vanilla TypeScript canvas RPG backed by Supabase tables, storage, and realtime.

# Files to touch
- Project scaffolding: package metadata, Vite config, TypeScript config, README, env examples, gitignore.
- Frontend source: HTML shell, CSS, TypeScript game/auth/backend/rendering modules, including auth loading, joystick controls, monsters, and power purchases.
- Supabase schema migration document for the prefixed tables, triggers, realtime publication, and storage policies.

# Verification approach
- Apply schema additions and storage policies to the shared Supabase project.
- Run typecheck, lint, build.
- Use isolated verification scripts outside the committed app to exercise Supabase RLS/storage and Playwright mobile flows.
- Deploy the built frontend preview and verify the uploaded index responds.

# Out of scope
- External sprite assets or third-party game engines; all visuals are procedural canvas/pixel drawing.
- Multiplayer authoritative movement server; ambient foxes use Supabase Realtime broadcast as requested.
