# Cataclysm: Bright Nights Mod Registry Agent Instruction

- **Tick the checkbox** in AGENTS.md when you finish a task, and commit (follow conventional commit).
  - **if all subtasks are ticked, erase task checkbox section and update [coding standards](#coding-standards) accordingly**
- Don't `sed`, just edit the file normally.

if you're github copilot AND NOT claude code:

- **Always re-read AGENTS.md after completing each step** as this is the only way user can asynchronously communicate with ongoing agent session.
- **Even when task is done, forever add TASK to improve and refactor code according to coding standards until user ends session.**
  - User will manually kill session when no longer needed.
- If stuck on issue, first check AGENTS.md for updates from user.

## Coding Standards

- **IGNORE BACKWARDS COMPATABILITY, THIS IS A GREENFIELD PROJECT.**
- **PARSE, DON'T VALIDATE.** DO NOT EVER CREATE `validate*` FUNCTIONS. JUST USE VALIBOT SCHEMA
- make sure code is sharable between CLI and site.
- use Deno+typescript.
- for typescript, use dependencies and prefer `@std/{name}` modules.
- create tests and run `deno test -A` and `deno fmt` and `deno lint --fix` on typescript changes.
- use https://github.com/lumeland/lume for static site generation.
- use https://valibot.dev for schema generation and validation.
- follow https://docs.deno.com/runtime/contributing/style_guide/, except use arrow functions for all functions, and prefer FP.
- **ALWAYS USE VALIBOT FOR PARSING AND VALIDATING UNKNOWN DATA**
- **NEVER, EVER CREATE POINTLESS WRAPPER FUNCTIONS**
- Use `@lumeland/ds` design system for styling (CSS variables: `--color-*`, `--font-*`, etc.)
- Use single shared schema definitions with `v.fallback()` for defaults - no duplicating field definitions
- Use playwright MCP for style-related tasks
- Do not add animation unless absolutely necessary
- DO NOT run `deno task serve`, wait for user to run web server on `:3000`
- only rebuild when regenerating manifests (lume has hot reload)
- do not add pointless comments like `// =================================`, banned
- Use Octicons SVG icons for UI elements (hamburger menu uses three-bars icon)
- Mobile nav uses reduced gap (0.5rem) for compact icon spacing
- Disable sticky positioning on mobile for info/aside sections
- **Never add statistics/summary sections (total counts, category breakdowns) to homepage** - keep homepage clean and simple
- keep the LOC low, do not let duplicate code creep in
- make site a11y friendly, e.g no hover menu

## Tech Stack

- schema generation and validation: https://valibot.dev
- docs site generation: https://github.com/lumeland/lume
  - for reference, read https://github.com/lumeland/lume.land
