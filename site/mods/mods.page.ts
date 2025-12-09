/**
 * Generate mod pages directly from manifest YAML files.
 * This replaces the separate generate script for mod pages.
 */

import * as YAML from "@std/yaml"
import { walk } from "@std/fs"
import { dirname, fromFileUrl, join } from "@std/path"
import type { ModManifest } from "../../src/schema/manifest.ts"
import { MetaData } from "lume/plugins/metas.ts"

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

/** Find parent mod if this mod has one */
const findParentMod = (
  manifest: ModManifest,
  allManifests: ModManifest[],
): ModManifest | undefined => {
  if (!manifest.parent) return undefined
  const parentId = manifest.parent.toLowerCase()
  return allManifests.find((m) => m.id.toLowerCase() === parentId)
}

/** Find submods (children) for this mod */
const findSubmods = (
  manifest: ModManifest,
  allManifests: ModManifest[],
): ModManifest[] => {
  const modId = manifest.id.toLowerCase()
  return allManifests.filter((m) => m.parent?.toLowerCase() === modId)
}

export default async function* () {
  const manifests = await loadManifests()

  yield* manifests.map((manifest) => ({
    url: `/mods/${manifest.id}/`,
    title: manifest.display_name,
    metas: {
      title: manifest.display_name,
      description: manifest.short_description,
      image: manifest.icon_url,
      type: "article",
      lang: "en",
      site: "=siteName",
      keywords: ["Cataclysm: Bright Nights", "BN", "mod"].concat(manifest.tags ?? []),
    } satisfies MetaData,
    tags: ["mod"],
    manifest,
    parentMod: findParentMod(manifest, manifests),
    submods: findSubmods(manifest, manifests),
    allManifests: manifests, // Pass all manifests for dependency resolution
  }))
}
