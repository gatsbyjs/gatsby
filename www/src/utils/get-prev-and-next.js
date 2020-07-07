const { loadYaml } = require(`./load-yaml`)
const docLinksData = loadYaml(`src/data/sidebars/doc-links.yaml`)
const tutorialLinksData = loadYaml(`src/data/sidebars/tutorial-links.yaml`)
const contributingLinksData = loadYaml(
  `src/data/sidebars/contributing-links.yaml`
)

const docLinks = docLinksData[0].items
const tutorialLinks = tutorialLinksData[0].items
const contributingLinks = contributingLinksData[0].items

// flatten sidebar links trees for easier next/prev link calculation
function flattenList(itemList) {
  return itemList.reduce((reducer, { items, ...rest }) => {
    reducer.push(rest)
    if (items) reducer.push(...flattenList(items))
    return reducer
  }, [])
}

function flattenFilterList(itemList) {
  const flattened = flattenList(itemList)
  return flattened.filter(item => item.link && !item.link.includes(`#`))
}

const flattenedNavs = {
  docs: flattenFilterList(docLinks),
  tutorials: flattenFilterList(tutorialLinks),
  contributing: flattenFilterList(contributingLinks),
}

function findDoc(doc) {
  if (!doc.link) return null
  return (
    doc.link === this.link ||
    doc.link === this.link.substring(0, this.link.length - 1) // deal with stubs
  )
}

function getPrevAndNext(slug) {
  const section = slug.split(`/`)[1]
  const sectionNav = flattenedNavs[section]
  if (!sectionNav) return null
  const index = sectionNav.findIndex(findDoc, { link: slug })
  if (index < 0) {
    return null
  }
  return {
    prev: index === 0 ? null : flattenedNavs[index - 1],
    next: index === flattenedNavs.length - 1 ? null : flattenedNavs[index + 1],
  }
}

module.exports = { getPrevAndNext }
