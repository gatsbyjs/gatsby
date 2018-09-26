const isItemActive = (location, item, activeItemHash) => {
  const linkMatchesPathname = item.link === location.pathname
  const linkWithoutHashMatchesPathname =
    item.link.replace(/#.*/, ``) === location.pathname
  const activeItemHashFalsy = !activeItemHash || activeItemHash === `NONE`

  if (activeItemHash) {
    if (activeItemHash === `NONE` && linkWithoutHashMatchesPathname) {
      return item
    }

    if (item.link === `${location.pathname}#${activeItemHash}`) {
      return item
    }
  }

  if (linkMatchesPathname && activeItemHashFalsy) {
    return item
  }

  if (item.link === `${location.pathname}${location.hash}` && !activeItemHash) {
    return item
  }

  if (linkMatchesPathname && !location.hash && !activeItemHash) {
    return item
  }

  return false
}

const getActiveItem = (itemList, location, activeItemHash) => {
  for (let item of itemList) {
    if (item.link) {
      if (isItemActive(location, item, activeItemHash)) return item
    }

    if (item.items) {
      let activeSubItem = getActiveItem(item.items, location, activeItemHash)
      if (activeSubItem) return activeSubItem
    }
  }

  return false
}

export default getActiveItem
