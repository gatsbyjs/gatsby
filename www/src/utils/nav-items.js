const _ = require(`lodash`)
const { loadYaml } = require(`./load-yaml`)
const navLinks = {
  docs: loadYaml(`src/data/sidebars/doc-links.yaml`),
  tutorial: loadYaml(`src/data/sidebars/tutorial-links.yaml`),
  contributing: loadYaml(`src/data/sidebars/contributing-links.yaml`),
}

/**
 * Flatten a nav hierarchy and append information about parents and children.
 */
function* flattenList(itemList, parents = []) {
  for (const item of itemList) {
    yield {
      ...item,
      // only keep the links of each child, not its entire sub-hierarchy
      items: item.items ? item.items.map(child => child.link) : null,
      parents,
    }
    if (item.items) {
      yield* flattenList(item.items, [item.link, ...parents])
    }
  }
}

const baseFlattenedNavs = _.mapValues(navLinks, navList => [
  ...flattenList(navList[0].items),
])

/**
 * Add a slash to the end of a slug so we don't end up with any mismatches
 */
function normalize(slug) {
  return slug.endsWith(`/`) ? slug : `${slug}/`
}

/**
 * Filter the list for all "normal" items and calculate the
 * previous and next nav items
 */
const prevNextBySlug = _.mapValues(baseFlattenedNavs, navList => {
  // ignore items without links and hashes when counting indices
  const filteredNavSlugs = navList
    .filter(item => item.link && !item.link.includes(`#`))
    .map(item => normalize(item.link))
  return Object.fromEntries(
    filteredNavSlugs.map((slug, index) => [
      slug,
      {
        prev: filteredNavSlugs[index - 1],
        next: filteredNavSlugs[index + 1],
      },
    ])
  )
})

/**
 * Compile a flattened list of navigation items from all the sidebars
 * with the following information:
 *
 *  - link: slug to the doc referenced by this nav item
 *  - title: Human-readable title of this nav item
 *  - parents: hierarchy of parents in reverse order
 *  - items: links of child items
 *  - prev: previous item in nav list
 *  - next: next item in nav list
 */
const navItems = _.flatMap(baseFlattenedNavs, (navList, section) =>
  navList.map(navItem => {
    return {
      ...navItem,
      ...prevNextBySlug[section][normalize(navItem.link || ``)],
      section,
    }
  })
)

module.exports = { navItems }
