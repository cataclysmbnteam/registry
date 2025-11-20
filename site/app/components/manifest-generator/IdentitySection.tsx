/// <reference lib="dom" />
/**
 * Identity form section for mod ID, name, and descriptions.
 */

import { store } from "./store.ts"

export const IdentitySection = () => (
  <section>
    <h3>Identity</h3>
    <fieldset>
      <label>ID *</label>
      <input
        type="text"
        placeholder="my_mod"
        value={store.id}
        onInput={(e) => (store.id = e.currentTarget.value)}
      />
      <small>Lowercase alphanumeric with underscores</small>
    </fieldset>
    <fieldset>
      <label>Display Name *</label>
      <input
        type="text"
        placeholder="My Mod"
        value={store.displayName}
        onInput={(e) => (store.displayName = e.currentTarget.value)}
      />
    </fieldset>
    <fieldset>
      <label>Short Description *</label>
      <input
        type="text"
        maxLength={200}
        placeholder="A brief description of your mod"
        value={store.shortDescription}
        onInput={(e) => (store.shortDescription = e.currentTarget.value)}
      />
      <small>{store.shortDescription.length}/200 characters</small>
    </fieldset>
    <fieldset>
      <label>Full Description</label>
      <textarea
        placeholder="Detailed description..."
        value={store.description}
        onInput={(e) => (store.description = e.currentTarget.value)}
      />
    </fieldset>
  </section>
)
