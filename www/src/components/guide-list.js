import React from "react"

import docsHierarchy from "../data/sidebars/doc-links.yaml"
import tutorialHierarchy from "../data/sidebars/tutorial-links.yaml"
import contributingHierarchy from "../data/sidebars/contributing-links.yaml"

// Search through tree, which may be 2, 3 or more levels deep
const childItemsBySlug = (
  docsHierarchy,
  tutorialHierarchy,
  contributingHierarchy,
  slug
) => {
  let result

  const iter = a => {
    if (a.link === slug) {
      result = a
      return true
    }
    return Array.isArray(a.items) && a.items.some(iter)
  }

  docsHierarchy.some(iter)
  tutorialHierarchy.some(iter)
  contributingHierarchy.some(iter)
  return result && result.items
}

const GuideList = ({ slug }) => {
  const subitemsForPage =
    childItemsBySlug(
      docsHierarchy,
      tutorialHierarchy,
      contributingHierarchy,
      slug
    ) || []
  const subitemList = subitemsForPage.map((subitem, i) => (
    <li key={i}>
      <a href={subitem.link}>{subitem.title}</a>
    </li>
  ))
  const toc = subitemList.length ? (
    <>
      <h2>In this section:</h2>
      <ul>{subitemList}</ul>
    </>
  ) : null
  return toc
}

export default GuideList
