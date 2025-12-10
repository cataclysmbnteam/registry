import { stripColorCodes } from "../src/utils/color.ts"
import { ModCard } from "./_includes/ModCard.tsx"
import type { ModPageData } from "./_includes/types.ts"

export const layout = "base.tsx"
export const title = "Home"

export default ({ search }: Lume.Data) => {
  // Get all mods and show the 6 most recently updated
  const mods = search.pages("mod") as ModPageData[]
  const recentMods = [...mods]
    .sort((a, b) => {
      // Sort by last_updated descending (newest first)
      const dateA = a.manifest.last_updated ?? ""
      const dateB = b.manifest.last_updated ?? ""
      // Mods without last_updated go to the end
      if (!dateA && !dateB) return stripColorCodes(a.title).localeCompare(stripColorCodes(b.title))
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.localeCompare(dateA)
    })
    .slice(0, 6)

  return (
    <>
      <header class="hero">
        <h1>Cataclysm: Bright Nights Mod Registry</h1>
      </header>

      <main class="content">
        {recentMods.length > 0 && (
          <section id="featured-section">
            <h2>Recently Updated Mods</h2>
            <div class="mod-grid">
              {recentMods.map((mod) => (
                <ModCard
                  key={mod.manifest.id}
                  url={mod.url}
                  title={mod.title}
                  manifest={mod.manifest}
                  showCategories
                />
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
    </>
  )
}
