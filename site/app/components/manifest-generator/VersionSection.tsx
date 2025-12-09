/// <reference lib="dom" />
/**
 * Version form section for version, game version, and dependencies.
 */

import { store } from "./store.ts"

export const VersionSection = () => (
  <section class="form-section">
    <h3>Version</h3>
    <div class="form-group">
      <label>Version *</label>
      <input
        type="text"
        placeholder="1.0.0"
        value={store.version}
        onInput={(e) => (store.version = e.currentTarget.value)}
      />
    </div>
    <div class="form-group">
      <label>Dependencies</label>
      <div class="dependencies-list">
        {store.dependencies.map(([modId, version], index) => (
          <div class="dependency-row" key={index}>
            <input
              type="text"
              placeholder="mod_id"
              value={modId}
              onInput={(e) =>
                store.dependencies[index][0] = e.currentTarget.value}
            />
            <input
              type="text"
              placeholder="version constraint"
              value={version}
              onInput={(e) =>
                store.dependencies[index][1] = e.currentTarget.value}
            />
            <button
              type="button"
              class="btn-remove"
              onClick={() => store.dependencies.splice(index, 1)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        class="btn-add"
        onClick={() => store.dependencies.push(["", ""])}
      >
        + Add Dependency
      </button>
    </div>
  </section>
)
