# Goal
Enhance Cinderwhisp Hollow's main gameplay UI with a more interactive, immersive 3D game-design style while keeping the existing vanilla TypeScript/Vite canvas architecture and Supabase-backed progression.

# Files to touch
- `src/main.ts` for 2.5D camera/rendering upgrades, layered world props, richer combat feedback, proximity interactions, and gameplay state exposed for verification.
- `src/styles.css` for glassy 3D HUD controls, cinematic overlays, and more responsive game-panel presentation.
- `README.md` to reflect the upgraded immersive gameplay presentation.

# Verification approach
- Run existing typecheck, lint, and production build.
- Use the real Supabase backend with a temporary auth user to verify sign-up, profile creation, RLS positive access, and unauthenticated negative access; then clean up test data and the test user.
- Serve the built frontend locally and drive it with Playwright from an external `verify/` workspace: sign up, load the game, capture multi-frame screenshots, fire at a monster, assert state changes, and check for console/network errors.
- Deploy the built frontend preview and verify the uploaded index responds.

# Out of scope
- External sprite assets or third-party game engines; all visuals stay procedural canvas/CSS.
- New persistent gameplay systems or schema changes beyond the existing Supabase tables.
