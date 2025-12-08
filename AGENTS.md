# Cataclysm: Bright Nights Mod Registry Agent Instruction

- **Always re-read AGENTS.md after completing each step** as this is the only way user can asynchronously communicate with ongoing agent session.
- **Even when task is done, forever wait for change in AGENTS.md**. User will manually kill session when no longer needed.
- **Tick the checkbox** in AGENTS.md when you finish a task, and commit (follow conventional commit).
  - **if all subtasks are ticked, erase task checkbox section and update [coding standards](#coding-standards) accordingly**
- If stuck on issue, first check AGENTS.md for updates from user.

## Coding Standards

- **IGNORE BACKWARDS COMPATABILITY, THIS IS A GREENFIELD PROJECT.**
- **PARSE, DON'T VALIDATE.** DO NOT EVER CREATE `validate*` FUNCTIONS. JUST USE VALIBOT SCHEMA
- make sure code is sharable between CLI and site.
- use Deno+typescript.
- for typescript, use dependencies and prefer `@std/{name}` modules.
- create tests and run `deno fmt` and `deno lint --fix` on typescript changes.
- use https://github.com/lumeland/lume for static site generation.
- use https://valibot.dev for schema generation and validation.
- follow https://docs.deno.com/runtime/contributing/style_guide/, except use arrow functions for all functions, and prefer FP.
- **ALWAYS USE VALIBOT FOR PARSING AND VALIDATING UNKNOWN DATA**
- **NEVER, EVER CREATE POINTLESS WRAPPER FUNCTIONS**
- Use `@lumeland/ds` design system for styling (CSS variables: `--color-*`, `--font-*`, etc.)
- Use single shared schema definitions with `v.fallback()` for defaults - no duplicating field definitions
- Use playwright MCP for style-related tasks
- DO NOT run `deno task serve`, wait for user to run web server on `:3000`

## TASKS

- [ ] mobile hamburger menu icon looks hideous, animates hideous, remove animation completely
- [ ] on nav, replace mods.json with API section with link to:
  - [ ] mods.json
  - [ ] mods.md (rename generated/MODS.md)
  - [ ] openapi spec page (a single GET /mods endpoint returning all mods), generate using e.g https://github.com/open-circle/valibot/tree/main/packages/to-json-schema and/or https://github.com/swagger-api/swagger-ui
- [ ] generate `generated/mods/{mod_id}.json` files for each yml manifest
- [ ] confirm that autoupdate works correctly
  - [ ] refer to https://github.com/endless-sky/rfcs/blob/main/rfcs/0001-plugin-index.md
  - [ ] write an E2E test

## Tech Stack

- schema generation and validation: https://valibot.dev
- docs site generation: https://github.com/lumeland/lume
  - for reference, read https://github.com/lumeland/lume.land
