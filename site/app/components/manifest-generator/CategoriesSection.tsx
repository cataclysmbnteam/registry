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
  <section>
    <h3>Categories and Tags</h3>
    <fieldset>
      <legend>Categories</legend>
      <div>
        {MOD_CATEGORIES.map((cat) => (
          <button
            type="button"
            key={cat}
            style={store.categories.includes(cat) ? { fontWeight: "bold" } : {}}
            onClick={() => toggleCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </fieldset>
    <fieldset>
      <label>Tags</label>
      {store.tags.map((tag, index) => (
        <div
          style={{ display: "flex", gap: "8px", marginBottom: "4px" }}
          key={index}
        >
          <input
            type="text"
            placeholder="tag"
            value={tag}
            onInput={(e) => store.tags[index] = e.currentTarget.value}
          />
          <button
            type="button"
            onClick={() => store.tags.splice(index, 1)}
          >
            &times;
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => store.tags.push("")}
      >
        Add Tag
      </button>
    </fieldset>
  </section>
)
