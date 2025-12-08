/**
 * Tests for manifest checking utilities.
 */

import { assertEquals } from "@std/assert"
import * as v from "valibot"
import { ModId, ModIdPattern, type ModManifest, SemVerRange } from "../schema/manifest.ts"
import { checkManifest, detectParentMod, hasParentIdPrefix } from "./validator.ts"

// Tests for SemVerRange schema
Deno.test("SemVerRange - exact version", () => {
  assertEquals(v.safeParse(SemVerRange, "1.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "0.9.1").success, true)
})

Deno.test("SemVerRange - comparison operators", () => {
  assertEquals(v.safeParse(SemVerRange, ">=1.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, ">1.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "<=2.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "<2.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "=1.0.0").success, true)
})

Deno.test("SemVerRange - caret ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "^1.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "^0.2.3").success, true)
  assertEquals(v.safeParse(SemVerRange, "^1.2.x").success, true)
})

Deno.test("SemVerRange - tilde ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "~1.2.3").success, true)
  assertEquals(v.safeParse(SemVerRange, "~1.2").success, true)
  assertEquals(v.safeParse(SemVerRange, "~1").success, true)
})

Deno.test("SemVerRange - x-ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "*").success, true)
  assertEquals(v.safeParse(SemVerRange, "1.x").success, true)
  assertEquals(v.safeParse(SemVerRange, "1.2.x").success, true)
  assertEquals(v.safeParse(SemVerRange, "1.X").success, true)
  assertEquals(v.safeParse(SemVerRange, "1.*").success, true)
})

Deno.test("SemVerRange - hyphen ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "1.0.0 - 2.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "1.2 - 2.3.4").success, true)
})

Deno.test("SemVerRange - compound ranges", () => {
  assertEquals(v.safeParse(SemVerRange, ">=1.0.0 <2.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, ">=1.2.3 <1.2.4").success, true)
})

Deno.test("SemVerRange - or ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "1.2.7 || >=1.2.9 <2.0.0").success, true)
  assertEquals(v.safeParse(SemVerRange, ">=1.0.0 <2.0.0 || >=3.0.0").success, true)
})

Deno.test("SemVerRange - prerelease", () => {
  assertEquals(v.safeParse(SemVerRange, ">=1.2.3-alpha.0").success, true)
  assertEquals(v.safeParse(SemVerRange, "~1.2.3-beta.2").success, true)
})

Deno.test("SemVerRange - rejects invalid ranges", () => {
  assertEquals(v.safeParse(SemVerRange, "").success, false)
  assertEquals(v.safeParse(SemVerRange, "not-a-version").success, false)
  assertEquals(v.safeParse(SemVerRange, "abc").success, false)
})

// Tests for ModId schema (URL-representable IDs)
Deno.test("ModId - valid lowercase with underscores", () => {
  assertEquals(v.safeParse(ModId, "arcana_patch").success, true)
  assertEquals(v.safeParse(ModId, "test_mod").success, true)
})

Deno.test("ModId - valid lowercase with dashes", () => {
  assertEquals(v.safeParse(ModId, "arcana-patch").success, true)
  assertEquals(v.safeParse(ModId, "test-mod").success, true)
})

Deno.test("ModId - valid starting with number", () => {
  assertEquals(v.safeParse(ModId, "3x_healing").success, true)
  assertEquals(v.safeParse(ModId, "123mod").success, true)
})

Deno.test("ModId - rejects uppercase", () => {
  assertEquals(v.safeParse(ModId, "Arcana").success, false)
  assertEquals(v.safeParse(ModId, "TestMod").success, false)
})

Deno.test("ModId - rejects spaces", () => {
  assertEquals(v.safeParse(ModId, "test mod").success, false)
  assertEquals(v.safeParse(ModId, "test mod patch").success, false)
})

Deno.test("ModId - rejects special characters", () => {
  assertEquals(v.safeParse(ModId, "mod@test").success, false)
  assertEquals(v.safeParse(ModId, "mod#1").success, false)
  assertEquals(v.safeParse(ModId, "mod/sub").success, false)
})

Deno.test("ModId - rejects empty string", () => {
  assertEquals(v.safeParse(ModId, "").success, false)
})

Deno.test("ModIdPattern - matches URL-representable strings", () => {
  assertEquals(ModIdPattern.test("arcana"), true)
  assertEquals(ModIdPattern.test("arcana_patch"), true)
  assertEquals(ModIdPattern.test("arcana-patch"), true)
  assertEquals(ModIdPattern.test("3x_healing"), true)
  assertEquals(ModIdPattern.test("mod123"), true)
})

Deno.test("checkManifest - valid manifest", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test Mod",
    short_description: "A test mod",
    author: ["Test Author"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://github.com/test/mod/archive/v1.0.0.zip",
    },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, true)
  assertEquals(result.errorCount, 0)
})

Deno.test("checkManifest - missing required fields", () => {
  const manifest: Partial<ModManifest> = {
    schema_version: "1.0",
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, false)
  assertEquals(result.errorCount > 0, true)
})

Deno.test("checkManifest - includes manifest ID in output", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test",
    short_description: "Test",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: {
      type: "github_archive",
      url: "https://example.com/mod.zip",
    },
  }

  const result = checkManifest(manifest, "test.yaml")
  assertEquals(result.output.includes("test.yaml"), true)
  assertEquals(result.output.includes("✓ Valid"), true)
})

Deno.test("checkManifest - shows error indicator", () => {
  const result = checkManifest({}, "test.yaml")
  assertEquals(result.output.includes("test.yaml"), true)
  assertEquals(result.output.includes("✗"), true)
})

// Tests for hasParentIdPrefix
Deno.test("hasParentIdPrefix - detects underscore separator", () => {
  assertEquals(hasParentIdPrefix("arcana_foo_patch", "arcana"), true)
  assertEquals(hasParentIdPrefix("arcana_patch", "arcana"), true)
})

Deno.test("hasParentIdPrefix - detects dash separator", () => {
  assertEquals(hasParentIdPrefix("arcana-foo-patch", "arcana"), true)
})

Deno.test("hasParentIdPrefix - rejects same id", () => {
  assertEquals(hasParentIdPrefix("arcana", "arcana"), false)
})

Deno.test("hasParentIdPrefix - rejects non-prefix", () => {
  assertEquals(hasParentIdPrefix("other_mod", "arcana"), false)
})

Deno.test("hasParentIdPrefix - rejects prefix without separator", () => {
  assertEquals(hasParentIdPrefix("arcanapatch", "arcana"), false)
})

// Tests for detectParentMod
Deno.test("detectParentMod - detects parent from dependencies", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "arcana_foo_patch",
    display_name: "Arcana Foo Patch",
    short_description: "Patch mod",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    dependencies: { arcana: "*", bn: ">=0.9.1" },
  }

  assertEquals(detectParentMod(manifest), "arcana")
})

Deno.test("detectParentMod - returns undefined when no match", () => {
  const manifest: ModManifest = {
    schema_version: "1.0",
    id: "standalone_mod",
    display_name: "Standalone Mod",
    short_description: "Standalone",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    dependencies: { bn: ">=0.9.1" },
  }

  assertEquals(detectParentMod(manifest), undefined)
})

// Tests for semantic validation via schema (now using checkManifest)
Deno.test("checkManifest - parent must be in dependencies", () => {
  const manifest = {
    schema_version: "1.0",
    id: "arcana_patch",
    display_name: "Patch",
    short_description: "Patch",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    parent: "arcana",
    dependencies: { bn: ">=0.9.1" },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, false)
  assertEquals(result.output.includes("dependencies"), true)
})

Deno.test("checkManifest - parent in dependencies is valid", () => {
  const manifest = {
    schema_version: "1.0",
    id: "arcana_patch",
    display_name: "Patch",
    short_description: "Patch",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    parent: "arcana",
    dependencies: { arcana: "*", bn: ">=0.9.1" },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, true)
})

Deno.test("checkManifest - mod cannot be its own parent", () => {
  const manifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test",
    short_description: "Test",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    parent: "test_mod",
    dependencies: { test_mod: "*" },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, false)
  assertEquals(result.output.includes("parent"), true)
})

Deno.test("checkManifest - cannot conflict and depend on same mod", () => {
  const manifest = {
    schema_version: "1.0",
    id: "test_mod",
    display_name: "Test",
    short_description: "Test",
    author: ["Test"],
    license: "MIT",
    version: "1.0.0",
    source: { type: "github_archive", url: "https://example.com/mod.zip" },
    dependencies: { some_mod: "*" },
    conflicts: { some_mod: "*" },
  }

  const result = checkManifest(manifest)
  assertEquals(result.valid, false)
  assertEquals(result.output.includes("conflict"), true)
})
