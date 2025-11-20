/**
 * Generate mod pages directly from manifest YAML files.
 * This replaces the separate generate script for mod pages.
 */

import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import { dirname, fromFileUrl, join } from "@std/path"
import type { ModManifest } from "../../src/schema/manifest.ts"

export const layout = "mod.tsx"

/**
 * Load all manifests from the manifests directory.
 */
const loadManifests = async (): Promise<ModManifest[]> => {
  const manifests: ModManifest[] = []
  // Get the project root (2 levels up from site/mods/)
  const projectRoot = join(dirname(fromFileUrl(import.meta.url)), "../..")
  const manifestDir = join(projectRoot, "manifests")

  for await (
    const entry of walk(manifestDir, {
      exts: [".yaml", ".yml"],
      includeDirs: false,
      maxDepth: 1,
    })
  ) {
    // Skip example files
    if (entry.name.startsWith("_")) continue

    try {
      const content = await Deno.readTextFile(entry.path)
      const manifest = YAML.parse(content) as ModManifest
      manifests.push(manifest)
    } catch (error) {
      console.error(`Error loading ${entry.path}: ${error}`)
    }
  }

  return manifests
}

export default async function* () {
  const manifests = await loadManifests()

  yield* manifests.map((manifest) => ({
    url: `/mods/${manifest.id}/`,
    title: manifest.displayName,
    tags: ["mod"],
    manifest,
  }))
}
