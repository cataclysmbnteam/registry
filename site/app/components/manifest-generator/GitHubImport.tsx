/**
 * GitHub import section for fetching mods from a GitHub repository.
 */

import { stripColorCodes } from "../../../../src/utils/github.ts"
import { store } from "./store.ts"

interface GitHubImportProps {
  onFetch: () => void
  onSelectMod: (index: number) => void
}

export const GitHubImport = ({
  onFetch,
  onSelectMod,
}: GitHubImportProps) => (
  <section class="form-section import-section">
    <h3>Import from GitHub</h3>
    <div class="form-group">
      <label>GitHub Repository URL</label>
      <div class="input-with-button">
        <input
          type="text"
          placeholder="https://github.com/owner/repo"
          value={store.githubUrl}
          onInput={(e) => (store.githubUrl = e.currentTarget.value)}
        />
        <button
          type="button"
          class="button is-primary"
          onClick={onFetch}
          disabled={store.isLoading}
        >
          {store.isLoading ? "Loading..." : "Fetch"}
        </button>
      </div>
    </div>
    {store.rateLimit && (
      <p class="rate-limit-info">
        GitHub API: {store.rateLimit.remaining} requests remaining (resets{" "}
        {store.rateLimit.reset.toLocaleTimeString()})
      </p>
    )}

    {store.foundMods.length > 0 && (
      <div class="found-mods">
        <label class="found-mods-label">
          Select a mod ({store.foundMods.length} found):
        </label>
        <ul class="mod-list">
          {store.foundMods.map((mod, i) => (
            <li
              key={i}
              class={`mod-list-item ${store.selectedModIndex === i ? "selected" : ""}`}
              onClick={() => onSelectMod(i)}
            >
              <strong class="mod-name">
                {stripColorCodes(mod.modinfo.name)}
              </strong>
              <small class="mod-path">{mod.path || "(root)"}</small>
            </li>
          ))}
        </ul>
      </div>
    )}
  </section>
)
