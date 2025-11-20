import { ModManifest } from "../mod.ts"
import { colorCodesToHtml, stripColorCodes } from "../src/utils/color.ts"

export const layout = "base.tsx"
export const title = "Home"

interface ModPageData {
  url: string
  title: string
  manifest: ModManifest
}

/** Default placeholder for mods without icons */
const PLACEHOLDER_ICON = "/assets/mod-placeholder.svg"

/**
 * Mod categories from CDDA/BN modinfo.json schema
 */
// const MOD_CATEGORIES = [
//   { value: "total_conversion", label: "Total Conversion" },
//   { value: "content", label: "Content" },
//   { value: "items", label: "Items" },
//   { value: "creatures", label: "Creatures" },
//   { value: "misc_additions", label: "Misc Additions" },
//   { value: "buildings", label: "Buildings" },
//   { value: "vehicles", label: "Vehicles" },
//   { value: "rebalance", label: "Rebalance" },
//   { value: "magical", label: "Magical" },
//   { value: "item_exclude", label: "Item Exclude" },
//   { value: "monster_exclude", label: "Monster Exclude" },
//   { value: "graphical", label: "Graphical" },
// ]

export default ({ search }: Lume.Data) => {
  // Get all mods and show the first 6 (sorted alphabetically by plain title)
  const mods = search.pages("mod") as ModPageData[]
  const recentMods = [...mods]
    .sort((a, b) => stripColorCodes(a.title).localeCompare(stripColorCodes(b.title)))
    .slice(0, 6)

  return (
    <>
      <header class="hero">
        <h1>Cataclysm: Bright Nights Mod Registry</h1>
      </header>

      {/* <div class="main-layout"> */}
      {
        /* <aside class="sidebar" id="category-sidebar">
          <nav>
            <h2>Categories</h2>
            <form id="category-filters">
              <ul class="category-list">
                {MOD_CATEGORIES.map((cat) => (
                  <li key={cat.value}>
                    <label>
                      <input
                        type="checkbox"
                        name="category"
                        value={cat.value}
                        data-category={cat.value}
                      />{" "}
                      {cat.label}
                    </label>
                  </li>
                ))}
              </ul>
            </form>
          </nav>
        </aside> */
      }

      <main class="content">
        {recentMods.length > 0 && (
          <section id="featured-section">
            <h2>Featured Mods</h2>
            <div class="mod-grid">
              {recentMods.map(({ url, title, manifest }) => (
                <article class="mod-card" key={manifest.id}>
                  <a href={url} class="mod-card-link">
                    <img
                      src={manifest.iconUrl || PLACEHOLDER_ICON}
                      alt={`${stripColorCodes(title)} icon`}
                      class="mod-card-icon"
                      width="80"
                      height="80"
                      loading="lazy"
                    />
                    <div class="mod-card-content">
                      <h3 dangerouslySetInnerHTML={{ __html: colorCodesToHtml(title) }} />
                      <div style={{ display: "flex", "justify-content": "space-between" }}>
                        <p class="mod-meta">
                          v{manifest.version} · {manifest.author}
                        </p>
                        <p class="mod-meta">
                          {manifest.categories?.join(", ")}
                        </p>
                      </div>
                      <p
                        class="mod-desc"
                        dangerouslySetInnerHTML={{
                          __html: colorCodesToHtml(manifest.shortDescription),
                        }}
                      />
                    </div>
                  </a>
                </article>
              ))}
            </div>
            <p>
              <a href="/mods/">View all {mods.length} mods</a>
            </p>
          </section>
        )}

        <noscript>
          <p>
            <a href="/mods/">View All Mods</a> (JavaScript required for category filtering)
          </p>
        </noscript>

        <section>
          <h2>For Mod Authors</h2>
          <p>
            Want to add your mod to the registry? Check out our{" "}
            <a href="/docs/submit/">submission guide</a>.
          </p>

          <h3>Quick Start</h3>
          <ol>
            <li>
              <strong>
                Use the <a href="/docs/generator/">Manifest Generator</a>
              </strong>{" "}
              to create your manifest file
            </li>
            <li>
              Fork the <a href="https://github.com/cataclysmbnteam/registry">registry repository</a>
            </li>
            <li>
              Add your manifest file to <code>manifests/your_mod_id.yaml</code>
            </li>
            <li>
              Run <code>deno task validate</code> to check your manifest
            </li>
            <li>Submit a pull request</li>
          </ol>

          <p style={{ marginTop: "1rem" }}>
            <a href="/docs/generator/" class="btn-primary">
              Open Manifest Generator
            </a>
          </p>
        </section>

        <section>
          <h2>Links</h2>
          <ul>
            <li>
              <a href="https://cataclysmbn.org/">Cataclysm: Bright Nights</a>
            </li>
            <li>
              <a href="https://github.com/cataclysmbnteam/registry">Registry on GitHub</a>
            </li>
            <li>
              <a href="https://github.com/cataclysmbnteam/registry/issues">Report an Issue</a>
            </li>
          </ul>
        </section>
      </main>
      {/* </div> */}
    </>
  )
}
