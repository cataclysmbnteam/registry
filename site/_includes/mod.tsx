import { ModManifest } from "../../mod.ts"
import { colorCodesToHtml, stripColorCodes } from "../../src/utils/color.ts"
import { ModCard, PLACEHOLDER_ICON } from "./ModCard.tsx"

export const layout = "base.tsx"

const HOME_ICON = "/assets/home-icon.svg"
const GITHUB_ICON = "/assets/github-icon.svg"

interface PageData {
  title: string
  manifest: ModManifest
  parentMod?: ModManifest
  submods?: ModManifest[]
  allManifests?: ModManifest[]
  children?: Lume.Data["children"]
}

/** Check if a mod ID exists in the registry */
const findModInRegistry = (modId: string, allManifests?: ModManifest[]): ModManifest | undefined =>
  allManifests?.find((m) =>
    m.id.toLowerCase() === modId.toLowerCase() ||
    m.display_name.toLowerCase() === modId.toLowerCase()
  )

const ModTitle = ({ title }: { title: string }) => (
  <h1 dangerouslySetInnerHTML={{ __html: colorCodesToHtml(title) }} />
)

export default (
  { manifest, parentMod, submods = [], allManifests = [] }: PageData,
  _helpers: Lume.Helpers,
) => (
  <article class="mod-page">
    <header>
      <img
        src={manifest?.icon_url ?? PLACEHOLDER_ICON}
        alt={`${stripColorCodes(manifest.display_name)} icon`}
        class="mod-icon"
        width="160"
        height="160"
      />
      {manifest.homepage
        ? (
          <a
            href={manifest.homepage}
            target="_blank"
            rel="noopener noreferrer"
            title="Visit Homepage"
            class="mod-homepage-link"
          >
            <ModTitle title={manifest.display_name} />
            <img
              src={/http(s)?:\/\/(www\.)?github\.com\/.*/.test(manifest.homepage)
                ? GITHUB_ICON
                : HOME_ICON}
              alt="(homepage)"
              width="32"
              height="32"
              aria-hidden="true"
            />
          </a>
        )
        : <ModTitle title={manifest.display_name} />}
    </header>

    <aside>
      <dl>
        <dt>Version</dt>
        <dd>{manifest.version}</dd>

        <dt>Author</dt>
        <dd>{manifest.author.join(", ")}</dd>

        <dt>License</dt>
        <dd>{manifest.license}</dd>

        {manifest.categories && manifest.categories.length > 0 && (
          <>
            <dt>Categories</dt>
            <dd class="mod-categories">
              {manifest.categories.map((category) => (
                <span class="badge" key={category}>{category}</span>
              ))}
            </dd>
          </>
        )}
      </dl>

      <button type="button">
        <a href={manifest.source.url}>
          Download
        </a>
      </button>
    </aside>

    <section class="mod-content">
      <h2>Description</h2>
      <div
        dangerouslySetInnerHTML={{
          __html: colorCodesToHtml(manifest.description || manifest.short_description),
        }}
      />

      <h2>Installation</h2>
      <p>
        Download:{" "}
        <a href={manifest.source.url}>
          <span
            dangerouslySetInnerHTML={{ __html: colorCodesToHtml(manifest.display_name) }}
          />{" "}
          v{manifest.version}
        </a>
      </p>
      {manifest.source.extract_path && (
        <p>
          <strong>Note:</strong> Extract the <code>{manifest.source.extract_path}</code>{" "}
          folder from the archive.
        </p>
      )}

      <h2>Compatibility</h2>
      <ul>
        <li>
          <strong>Dependencies:</strong>{" "}
          <DepList deps={manifest.dependencies} allManifests={allManifests} />
        </li>
        <li>
          <strong>Conflicts:</strong>{" "}
          <DepList deps={manifest.conflicts} allManifests={allManifests} />
        </li>
      </ul>

      {manifest.tags && manifest.tags.length > 0 && (
        <>
          <h2>Tags</h2>
          <div class="mod-categories">
            {manifest.tags.map((tag) => <span class="badge" key={tag}>{tag}</span>)}
          </div>
        </>
      )}

      {parentMod && (
        <>
          <h2>Parent Mod</h2>
          <div class="mod-grid related-mods">
            <ModCard
              key={parentMod.id}
              url={`/mods/${parentMod.id}/`}
              title={parentMod.display_name}
              manifest={parentMod}
            />
          </div>
        </>
      )}

      {submods.length > 0 && (
        <>
          <h2>Submods</h2>
          <div class="mod-grid related-mods">
            {submods.map((submod) => (
              <ModCard
                key={submod.id}
                url={`/mods/${submod.id}/`}
                title={submod.display_name}
                manifest={submod}
              />
            ))}
          </div>
        </>
      )}
    </section>
  </article>
)

/** Render dependencies/conflicts as clickable links when they exist in registry */
const DepList = (
  { deps, allManifests }: { deps?: Record<string, string>; allManifests: ModManifest[] },
) => {
  const entries = Object.entries(deps ?? {})
  if (entries.length === 0) return <span>None</span>

  return (
    <>
      {entries.map(([modId, version], i) => {
        const foundMod = findModInRegistry(modId, allManifests)
        return (
          <span key={modId}>
            {foundMod
              ? (
                <a href={`/mods/${foundMod.id}/`} class="dep-link">
                  {modId}
                </a>
              )
              : <span>{modId}</span>} <span class="version-constraint">{version}</span>
            {i < entries.length - 1 && ", "}
          </span>
        )
      })}
    </>
  )
}
