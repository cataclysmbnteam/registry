import { ModManifest } from "../../mod.ts"
import { colorCodesToHtml, stripColorCodes } from "../../src/utils/color.ts"

export const layout = "base.tsx"
export const title = "All Mods"

interface ModPageData {
  url: string
  title: string
  manifest: ModManifest
}

/** Default placeholder for mods without icons */
const PLACEHOLDER_ICON = "/assets/mod-placeholder.svg"

export default ({ search }: Lume.Data) => {
  const mods = search.pages("mod") as ModPageData[]
  // Sort by plain title (without color codes)
  const sortedMods = [...mods].sort((a, b) =>
    stripColorCodes(a.title).localeCompare(stripColorCodes(b.title))
  )

  return (
    <>
      <h1>All Mods</h1>
      <p>Browse all {sortedMods.length} mods in the registry.</p>

      {sortedMods.length === 0
        ? (
          <p>
            No mods found. <a href="/docs/submit/">Submit the first one!</a>
          </p>
        )
        : (
          <div class="mod-grid">
            {sortedMods.map(({ url, title, manifest }) => (
              <div class="mod-card" key={manifest.id}>
                <a href={url} class="mod-card-link">
                  <img
                    src={manifest?.iconUrl ?? PLACEHOLDER_ICON}
                    alt={`${stripColorCodes(title)} icon`}
                    class="mod-card-icon"
                    width="80"
                    height="80"
                    loading="lazy"
                  />
                  <div class="mod-card-content">
                    <h3 dangerouslySetInnerHTML={{ __html: colorCodesToHtml(title) }} />
                    <p class="mod-meta">
                      v{manifest.version} · {manifest.author}
                    </p>
                    <p
                      class="mod-desc"
                      dangerouslySetInnerHTML={{
                        __html: colorCodesToHtml(manifest.shortDescription),
                      }}
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
    </>
  )
}
