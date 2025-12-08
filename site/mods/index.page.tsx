import { ModManifest } from "../../mod.ts"
import { stripColorCodes } from "../../src/utils/color.ts"
import { ModCard } from "../_includes/ModCard.tsx"

export const layout = "base.tsx"
export const title = "All Mods"

interface ModPageData {
  url: string
  title: string
  manifest: ModManifest
}

/** Group mods by parent, with the parent mod and its submods */
interface ModGroup {
  main: ModPageData
  submods: ModPageData[]
}

/**
 * Group mods by their `parent` field.
 * Parent mods appear as the main card, submods are grouped under them.
 */
const groupModsByParent = (mods: ModPageData[]): ModGroup[] => {
  // Create a map of mod ID -> page data for easy lookup
  const modMap = new Map<string, ModPageData>()
  for (const mod of mods) {
    modMap.set(mod.manifest.id.toLowerCase(), mod)
  }

  // Group submods by their parent
  const submodsByParent = new Map<string, ModPageData[]>()
  const parentMods: ModPageData[] = []

  for (const mod of mods) {
    if (mod.manifest.parent) {
      const parentId = mod.manifest.parent.toLowerCase()
      const submods = submodsByParent.get(parentId) ?? []
      submods.push(mod)
      submodsByParent.set(parentId, submods)
    } else {
      parentMods.push(mod)
    }
  }

  // Build groups: parent mods with their submods
  const groups: ModGroup[] = []

  for (const mod of parentMods) {
    const modId = mod.manifest.id.toLowerCase()
    const submods = submodsByParent.get(modId) ?? []
    groups.push({ main: mod, submods })
  }

  // Sort groups by main mod title
  return groups.sort((a, b) =>
    stripColorCodes(a.main.title).localeCompare(stripColorCodes(b.main.title))
  )
}

export default ({ search }: Lume.Data) => {
  const mods = search.pages("mod") as ModPageData[]
  const groups = groupModsByParent(mods)
  const totalMods = mods.length

  return (
    <>
      <h1>All Mods</h1>
      <p>Browse all {totalMods} mods in the registry.</p>

      {groups.length === 0
        ? (
          <p>
            No mods found. <a href="/docs/submit/">Submit the first one!</a>
          </p>
        )
        : (
          <div class="mod-grid">
            {groups.map((group) => (
              <ModCard
                key={group.main.manifest.id}
                url={group.main.url}
                title={group.main.title}
                manifest={group.main.manifest}
                showCategories
                submodCount={group.submods.length}
              />
            ))}
          </div>
        )}
    </>
  )
}
