const _ = require(`lodash`)
const { loadYaml } = require(`./load-yaml`)
const navLinks = {
  docs: loadYaml(`src/data/sidebars/doc-links.yaml`),
  tutorial: loadYaml(`src/data/sidebars/tutorial-links.yaml`),
  contributing: loadYaml(`src/data/sidebars/contributing-links.yaml`),
}

// flatten sidebar links trees for easier next/prev link calculation
function flattenList(itemList) {
  return itemList.reduce((reducer, { items, ...rest }) => {
    reducer.push(rest)
    if (items) reducer.push(...flattenList(items))
    return reducer
  }, [])
}

function normalize(slug) {
  return slug.endsWith(`/`) ? slug : `${slug}/`
}

const flattenedNavs = _.mapValues(navLinks, navList => {
  const flattened = flattenList(navList[0].items)
  return flattened.filter(item => item.link && !item.link.includes(`#`))
})

const navIndicesBySlug = _.mapValues(flattenedNavs, navList =>
  Object.fromEntries(
    navList.map((item, index) => [normalize(item.link), index])
  )
)

function getPrevAndNext(slug) {
  const section = slug.split(`/`)[1]
  const sectionNav = flattenedNavs[section]
  if (!sectionNav) return null
  const index = navIndicesBySlug[section][normalize(slug)]
  if (_.isNil(index)) return null
  return {
    prev: sectionNav[index - 1] || null,
    next: sectionNav[index + 1] || null,
  }
}

module.exports = { getPrevAndNext }
