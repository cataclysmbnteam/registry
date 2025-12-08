/**
 * Shared ModCard component for displaying mod cards across the site.
 */

import type { ModManifest } from "../../mod.ts"
import { colorCodesToHtml, stripColorCodes } from "../../src/utils/color.ts"

/** Default placeholder for mods without icons */
export const PLACEHOLDER_ICON = "/assets/mod-placeholder.svg"

export interface ModCardProps {
  url: string
  title: string
  manifest: ModManifest
  /** Whether to show categories (used on home page) */
  showCategories?: boolean
  /** Number of submods (patches, addons) for this mod group */
  submodCount?: number
  /** Key prop for React rendering */
  key?: string
}

/**
 * Reusable mod card component for displaying mod information in a grid.
 */
export const ModCard = (
  { url, title, manifest, showCategories = false, submodCount = 0 }: ModCardProps,
) => (
  <article class={`mod-card ${submodCount > 0 ? "mod-card-stacked" : ""}`}>
    {submodCount > 0 && (
      <>
        <div class="mod-card-stack mod-card-stack-3" />
        <div class="mod-card-stack mod-card-stack-2" />
      </>
    )}
    <a href={url} class="mod-card-link">
      <img
        src={manifest.icon_url || PLACEHOLDER_ICON}
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
          {submodCount > 0 && <span class="badge submod-badge">+{submodCount} submods</span>}
        </p>
        {showCategories && manifest.categories && manifest.categories.length > 0 && (
          <div class="mod-categories">
            {manifest.categories.map((category) => (
              <span class="badge" key={category}>{category}</span>
            ))}
          </div>
        )}
        <p
          class="mod-desc"
          dangerouslySetInnerHTML={{
            __html: colorCodesToHtml(manifest.short_description),
          }}
        />
      </div>
    </a>
  </article>
)
