const isParentActive = (sections, parentTitle) => {
  for (let section of sections) {
    if (section.title === parentTitle) return section
    if (section.items) {
      for (let items of section.items) {
        const activeSubItem = isParentActive([items], parentTitle)
        if (activeSubItem) return activeSubItem
      }
    }
  }

  return false
}

// return items up the sidebar's hierarchy
const getActiveItemParents = (
  itemList,
  activeItemLink,
  activeItemParents = []
) => {
  if (activeItemLink.parentTitle) {
    const bar = isParentActive(itemList, activeItemLink.parentTitle)
    activeItemParents.push(bar)
    return getActiveItemParents(itemList, bar, activeItemParents)
  } else {
    return activeItemParents
  }
}

export default getActiveItemParents
