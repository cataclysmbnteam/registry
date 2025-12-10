import { partition, sortBy } from "@std/collections"
import { stripColorCodes } from "../../src/utils/color.ts"
import { ModCard } from "../_includes/ModCard.tsx"
import type { ModPageData } from "../_includes/types.ts"

export const layout = "base.tsx"
export const title = "All Mods"

/** Group mods by parent, with the parent mod and its submods */
interface ModGroup {
  main: ModPageData
  submods: ModPageData[]
}

/**
 * Group mods by their `parent` field.
 * Parent mods appear as the main card, submods are grouped under them.
 */
const groupModsByParent = (mods: ModPageData[]): ModGroup[] => {
  // Partition mods into parent mods and submods
  const [submods, parentMods] = partition(mods, (mod) => Boolean(mod.manifest.parent))

  // Group submods by their parent ID
  const submodsByParent = Map.groupBy(submods, (mod) => mod.manifest.parent!.toLowerCase())

  // Build groups: parent mods with their submods
  const groups = parentMods.map((mod) => ({
    main: mod,
    submods: submodsByParent.get(mod.manifest.id.toLowerCase()) ?? [],
  }))

  // Sort groups by main mod title
  return sortBy(groups, (g) => stripColorCodes(g.main.title))
}

/** Collect all unique categories from mods */
const collectCategories = (mods: ModPageData[]): string[] =>
  [...new Set(mods.flatMap((mod) => mod.manifest.categories ?? []))].sort()

/** Client-side filtering script for category and search */
const filterScript = `
  const filterMods = () => {
    const searchInput = document.getElementById('mod-search');
    const searchTerm = searchInput?.value?.toLowerCase() ?? '';
    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked'))
      .map(cb => cb.value);
    
    const cards = document.querySelectorAll('.mod-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const title = card.dataset.title?.toLowerCase() ?? '';
      const description = card.dataset.description?.toLowerCase() ?? '';
      const categories = (card.dataset.categories ?? '').split(',').filter(Boolean);
      
      const matchesSearch = !searchTerm || 
        title.includes(searchTerm) || 
        description.includes(searchTerm);
      
      const matchesCategory = checkedCategories.length === 0 || 
        checkedCategories.some(cat => categories.includes(cat));
      
      const visible = matchesSearch && matchesCategory;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });
    
    const countEl = document.getElementById('visible-count');
    if (countEl) countEl.textContent = visibleCount;
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mod-search')?.addEventListener('input', filterMods);
    document.querySelectorAll('.category-filter').forEach(cb => {
      cb.addEventListener('change', filterMods);
    });
  });
`

export default ({ search }: Lume.Data) => {
  const mods = search.pages("mod") as ModPageData[]
  const groups = groupModsByParent(mods)
  const totalMods = mods.length
  const categories = collectCategories(mods)

  return (
    <>
      <h1>All Mods</h1>
      <p>
        Browse all <span id="visible-count">{totalMods}</span> of {totalMods} mods in the registry.
      </p>

      <div class="mods-layout">
        {/* Filters Sidebar */}
        <aside class="filters-aside">
          <div class="search-box">
            <input
              type="text"
              id="mod-search"
              placeholder="Search mods..."
              class="search-input"
              aria-label="Search mods by name or description"
            />
          </div>

          {categories.length > 0 && (
            <div class="category-filters">
              <h3>Categories</h3>
              {categories.map((category) => (
                <label class="category-checkbox" key={category}>
                  <input
                    type="checkbox"
                    class="category-filter"
                    value={category}
                  />
                  {category}
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* Mod Grid */}
        <div class="mods-content">
          {groups.length === 0
            ? (
              <p>
                No mods found. <a href="/docs/submit/">Submit the first one!</a>
              </p>
            )
            : (
              <div class="mod-grid">
                {groups.map((group) => (
                  <ModCard
                    key={group.main.manifest.id}
                    url={group.main.url}
                    title={group.main.title}
                    manifest={group.main.manifest}
                    showCategories
                    submodCount={group.submods.length}
                  />
                ))}
              </div>
            )}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: filterScript }} />
    </>
  )
}
