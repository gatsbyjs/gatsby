const _ = require(`lodash`)
const { loadYaml } = require(`./load-yaml`)
const navLinks = {
  docs: loadYaml(`src/data/sidebars/doc-links.yaml`),
  tutorial: loadYaml(`src/data/sidebars/tutorial-links.yaml`),
  contributing: loadYaml(`src/data/sidebars/contributing-links.yaml`),
}

function* flattenList(itemList, parents = []) {
  for (const item of itemList) {
    yield {
      ...item,
      items: item.items ? item.items.map(child => child.link) : null,
      parents,
    }
    if (item.items) {
      yield* flattenList(item.items, [item.link, ...parents])
    }
  }
}

function normalize(slug) {
  return slug.endsWith(`/`) ? slug : `${slug}/`
}

const baseFlattenedNavs = _.mapValues(navLinks, navList => [
  ...flattenList(navList[0].items),
])

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
