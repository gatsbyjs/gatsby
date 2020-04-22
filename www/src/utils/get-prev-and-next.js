const fs = require(`fs-extra`)
const yaml = require(`js-yaml`)
const docLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/doc-links.yaml`)
)
const tutorialLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/tutorial-links.yaml`)
)
const contributingLinksData = yaml.load(
  fs.readFileSync(`./src/data/sidebars/contributing-links.yaml`)
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

const flattenedDocs = flattenList(docLinks)
const flattenedTutorials = flattenList(tutorialLinks)
const flattenedContributing = flattenList(contributingLinks)

// with flattened tree object finding next and prev is just getting the next index
function getSibling(index, list, direction) {
  if (direction === `next`) {
    const next = index === list.length - 1 ? null : list[index + 1]
    // for tutorial links that use subheadings on the same page skip the link and try the next item
    if (next && next.link && next.link.includes(`#`)) {
      return getSibling(index + 1, list, `next`)
    }
    return next
  } else if (direction === `prev`) {
    const prev = index === 0 ? null : list[index - 1]
    if (prev && prev.link && prev.link.includes(`#`)) {
      return getSibling(index - 1, list, `prev`)
    }
    return prev
  } else {
    reporter.warn(
      `Did not provide direction to sibling function for building next and prev links`
    )
    return null
  }
}

function findDoc(doc) {
  if (!doc.link) return null
  return (
    doc.link === this.link ||
    doc.link === this.link.substring(0, this.link.length - 1)
  )
}

function getPrevAndNext(slug) {
  const docIndex = flattenedDocs.findIndex(findDoc, {
    link: slug,
  })
  const tutorialIndex = flattenedTutorials.findIndex(findDoc, {
    link: slug,
  })
  const contributingIndex = flattenedContributing.findIndex(findDoc, {
    link: slug,
  })

  // add values to page context for next and prev page
  let prevAndNext = {}
  if (docIndex > -1) {
    prevAndNext.prev = getSibling(docIndex, flattenedDocs, `prev`)
    prevAndNext.next = getSibling(docIndex, flattenedDocs, `next`)
  }
  if (tutorialIndex > -1) {
    prevAndNext.prev = getSibling(tutorialIndex, flattenedTutorials, `prev`)
    prevAndNext.next = getSibling(tutorialIndex, flattenedTutorials, `next`)
  }
  if (contributingIndex > -1) {
    prevAndNext.prev = getSibling(
      contributingIndex,
      flattenedContributing,
      `prev`
    )
    prevAndNext.next = getSibling(
      contributingIndex,
      flattenedContributing,
      `next`
    )
  }
  return prevAndNext
}

module.exports = { getPrevAndNext }
