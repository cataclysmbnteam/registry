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
  <section>
    <h3>Import from GitHub</h3>
    <fieldset>
      <label>GitHub Repository URL</label>
      <input
        type="text"
        placeholder="https://github.com/owner/repo"
        value={store.githubUrl}
        onInput={(e) => (store.githubUrl = e.currentTarget.value)}
      />
      <button
        type="button"
        onClick={onFetch}
        disabled={store.isLoading}
      >
        {store.isLoading ? "Loading..." : "Fetch Mods"}
      </button>
    </fieldset>
    {store.rateLimit && (
      <p>
        GitHub API: {store.rateLimit.remaining} requests remaining (resets{" "}
        {store.rateLimit.reset.toLocaleTimeString()})
      </p>
    )}

    {store.foundMods.length > 0 && (
      <div style={{ marginTop: "1rem" }}>
        <label
          style={{ fontWeight: 600, marginBottom: "0.5rem", display: "block" }}
        >
          Select a mod ({store.foundMods.length} found):
        </label>
        <ul>
          {store.foundMods.map((mod, i) => (
            <li
              key={i}
              style={{
                cursor: "pointer",
                padding: "0.5rem",
                backgroundColor: store.selectedModIndex === i ? "#e0e0e0" : "transparent",
              }}
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
