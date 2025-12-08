/// <reference lib="dom" />
/**
 * Categories and tags form section.
 */

import { MOD_CATEGORIES } from "./types.ts"
import { store } from "./store.ts"

/** Toggle a category in the store */
const toggleCategory = (cat: string) => {
  if (store.categories.includes(cat)) {
    store.categories = store.categories.filter((c) => c !== cat)
  } else {
    store.categories = [...store.categories, cat]
  }
}

export const CategoriesSection = () => (
  <section class="form-section">
    <h3>Categories and Tags</h3>
    <div class="form-group">
      <label>Categories</label>
      <div class="badge-group">
        {MOD_CATEGORIES.map((cat) => (
          <span
            key={cat}
            class={`badge badge-selectable ${
              store.categories.includes(cat) ? "badge-selected" : ""
            }`}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>
    <div class="form-group">
      <label>Tags</label>
      <div class="badge-group">
        {store.tags.map((tag, index) => (
          tag
            ? (
              <span key={index} class="badge badge-tag">
                {tag}
                <button
                  type="button"
                  class="badge-remove"
                  onClick={() => store.tags.splice(index, 1)}
                >
                  ×
                </button>
              </span>
            )
            : (
              <div key={index} class="tag-input-wrapper">
                <input
                  type="text"
                  class="tag-input"
                  placeholder="Enter tag"
                  value={tag}
                  onInput={(e) => store.tags[index] = e.currentTarget.value}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      e.preventDefault()
                    }
                  }}
                />
                <button
                  type="button"
                  class="badge-remove"
                  onClick={() => store.tags.splice(index, 1)}
                >
                  ×
                </button>
              </div>
            )
        ))}
        <button
          type="button"
          class="badge badge-add"
          onClick={() => store.tags.push("")}
        >
          + Add Tag
        </button>
      </div>
    </div>
  </section>
)
