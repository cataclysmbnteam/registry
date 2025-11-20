import { ModManifest } from "../../mod.ts"
import { colorCodesToHtml, stripColorCodes } from "../../src/utils/color.ts"

export const layout = "base.tsx"

interface ModData {
  id: string
  version: string
  author: string
  license: string
  categories?: string[]
  iconUrl?: string
}

interface PageData {
  title: string
  manifest: ModManifest
  children?: Lume.Data["children"]
}

/** Default placeholder for mods without icons */
const PLACEHOLDER_ICON = "/assets/mod-placeholder.svg"

export default ({ manifest }: PageData, _helpers: Lume.Helpers) => (
  <article class="mod-page">
    <header>
      <img
        src={manifest?.iconUrl ?? PLACEHOLDER_ICON}
        alt={`${stripColorCodes(manifest.displayName)} icon`}
        class="mod-icon"
        width="160"
        height="160"
      />
      <h1 dangerouslySetInnerHTML={{ __html: colorCodesToHtml(manifest.displayName) }} />
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
            <dd>{manifest.categories.join(", ")}</dd>
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
          __html: colorCodesToHtml(manifest.description || manifest.shortDescription),
        }}
      />

      <h2>Installation</h2>
      <p>
        Download:{" "}
        <a href={manifest.source.url}>
          <span
            dangerouslySetInnerHTML={{ __html: colorCodesToHtml(manifest.displayName) }}
          />{" "}
          v{manifest.version}
        </a>
      </p>
      {manifest.source.extractPath && (
        <p>
          <strong>Note:</strong> Extract the <code>{manifest.source.extractPath}</code>{" "}
          folder from the archive.
        </p>
      )}

      <h2>Compatibility</h2>
      <ul>
        <li>
          <strong>Dependencies:</strong> {formatDeps(manifest.dependencies)}
        </li>
        <li>
          <strong>Conflicts:</strong> {formatDeps(manifest.conflicts)}
        </li>
      </ul>

      {manifest.tags && (
        <>
          <h2>Tags</h2>
          <p>{manifest.tags.join(", ")}</p>
        </>
      )}
    </section>
  </article>
)

const formatDeps = (deps?: Record<string, string>) =>
  Object.entries(deps ?? {}).map(([modId, version]) => (
    <div key={modId} class="flex">
      <span>{modId}</span>
      <span>{version}</span>
    </div>
  ))
