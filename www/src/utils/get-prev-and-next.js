const { loadYaml } = require(`./load-yaml`)
const docLinks = loadYaml(`src/data/sidebars/doc-links.yaml`)
const tutorialLinks = loadYaml(`src/data/sidebars/tutorial-links.yaml`)
const contributingLinks = loadYaml(`src/data/sidebars/contributing-links.yaml`)

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
  docs: flattenFilterList(docLinks[0].items),
  tutorial: flattenFilterList(tutorialLinks[0].items),
  contributing: flattenFilterList(contributingLinks[0].items),
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
    prev: index === 0 ? null : sectionNav[index - 1],
    next: index === sectionNav.length - 1 ? null : sectionNav[index + 1],
  }
}

module.exports = { getPrevAndNext }
