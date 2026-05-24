# Goal
Reduce Cinderwhisp Hollow gameplay lag, simplify the app down to the core game/store flow, remove talk/codex/awakened sections, fix auth/logout UX regressions, and add monster levels plus points/treasure collection.

# Files to touch
- `src/main.ts` for render-loop optimization, level/points/treasure gameplay, simplified navigation/interactions, and auth/logout state fixes.
- `src/styles.css` for lighter overlays, two-tab navigation, treasure/level UI polish, and auth scroll stability.
- `README.md` for updated gameplay notes.

# Verification approach
- Run typecheck, lint, and production build.
- Use real Supabase auth/users from an external verification workspace to confirm profile creation, treasure persistence through existing profile fields, RLS positive/negative behavior, and cleanup.
- Serve the built frontend locally and drive a mobile Playwright flow: sign in, verify no auth scroll jump, collect treasure, fight a leveled monster, switch only between Game/Store, sign out, confirm the sign-in button is not stuck spinning, and capture animation/state deltas.
- Deploy the built frontend preview and verify the uploaded index responds.

# Out of scope
- New art assets, third-party engines, or extra schema changes; performance fixes keep the procedural canvas approach and reuse the existing profile table.
- A new leaderboard or multiplayer combat system.
