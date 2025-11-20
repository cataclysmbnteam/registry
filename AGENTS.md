# Cataclysm: Bright Nights Mod Registry Agent Instruction

- **Always re-read AGENTS.md after completing each step** as this is the only way user can asynchronously communicate with ongoing agent session.
- **Even when task is done, forever wait for change in AGENTS.md**. User will manually kill session when no longer needed.
- **Tick the checkbox** in AGENTS.md when you finish a task, and commit (follow conventional commit).
  - **if all subtasks are ticked, erase task checkbox section and update [coding standards](#coding-standards) accordingly**
- If stuck on issue, first check AGENTS.md for updates from user.

## TASKS

- [x] registry mod version must follow semver.
  - [x] when creating registry from modinfo.json, wrong values should be replaced with default values
    - Already implemented: `v.parse(v.fallback(SemVer, "0.0.0"), mod.modinfo.version)` in fetch.ts
- [ ] migrate web form logic to https://modularforms.dev/preact/guides/introduction
  - [ ] remove getManifestYaml and just directly use valibot schema with defaults
- [x] use idiomatic signals, that is, value/setValue is forbidden; just import global store signal and use it
  - Created store.ts with global deepsignal store
  - Child components import store directly instead of props
  - No more useDeepSignal or prop drilling
- [x] implement search using https://lume.land/plugins/pagefind/
  - [ ] make search bar only search for mods, not whole site.
  - [ ] make search bar in docs/ only search docs.
- [ ] using playwright MCP, forever iterate to make it look better but still use semantic HTML.
  - [ ] deduplicate mod card logic

## Coding Standards

- **IGNORE BACKWARDS COMPATABILITY, THIS IS A GREENFIELD PROJECT.**
- use Deno+typescript.
- for typescript, use dependencies and prefer `@std/{name}` modules.
- create tests and run `deno fmt` and `deno lint --fix` on typescript changes.
- use https://github.com/lumeland/lume for static site generation.
  https://endless-sky.github.io/plugins.html
- use https://valibot.dev for schema generation and validation.
- follow https://docs.deno.com/runtime/contributing/style_guide/, except use arrow functions for all functions, and prefer FP.
- **ALWAYS USE VALIBOT FOR PARSING AND VALIDATING UNKNOWN DATA**

## Tech Stack

- schema generation and validation: https://valibot.dev
- docs site generation: https://github.com/lumeland/lume
  - for reference, read https://github.com/lumeland/lume.land
