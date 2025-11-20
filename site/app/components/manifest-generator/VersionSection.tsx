/// <reference lib="dom" />
/**
 * Version form section for version, game version, and dependencies.
 */

import { store } from "./store.ts"

export const VersionSection = () => (
  <section>
    <h3>Version</h3>
    <fieldset>
      <label>Version *</label>
      <input
        type="text"
        placeholder="1.0.0"
        value={store.version}
        onInput={(e) => (store.version = e.currentTarget.value)}
      />
    </fieldset>
    <fieldset>
      <label>Dependencies</label>
      {store.dependencies.map(([modId, version], index) => (
        <div
          style={{ display: "flex", gap: "8px", marginBottom: "4px" }}
          key={index}
        >
          <input
            type="text"
            placeholder="mod_id"
            value={modId}
            onInput={(e) => {
              store.dependencies[index][0] = e.currentTarget.value
            }}
          />
          <input
            type="text"
            placeholder="version constraint"
            value={version}
            onInput={(e) => {
              store.dependencies[index][1] = e.currentTarget.value
            }}
          />
          <button
            type="button"
            onClick={() => {
              store.dependencies.splice(index, 1)
            }}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => store.dependencies.push(["", ""])}
      >
        + Add Dependency
      </button>
    </fieldset>
  </section>
)
