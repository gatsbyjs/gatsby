import React from "react"

import { useItemList } from "../utils/sidebar/item-list"

// Search through tree, which may be 2, 3 or more levels deep
const childItemsBySlug = (hierarchy, slug) => {
  let result

  const iter = a => {
    if (a.link === slug) {
      result = a
      return true
    }
    return Array.isArray(a.items) && a.items.some(iter)
  }
  hierarchy.some(iter)
  return result && result.items
}

const GuideList = ({ slug }) => {
  const itemList = useItemList(slug)
  const subitemsForPage = childItemsBySlug(itemList.items, slug) || []
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
