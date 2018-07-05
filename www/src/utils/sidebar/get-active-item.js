const isItemActive = (location, item, activeItemHash) => {
  const linkMatchesPathname = item.link === location.pathname
  const linkWithoutHashMatchesPathname =
    item.link.replace(/#.*/, ``) === location.pathname
  const activeItemHashFalsy = !activeItemHash || activeItemHash === `NONE`

  if (activeItemHash) {
    if (activeItemHash === `NONE` && linkWithoutHashMatchesPathname) {
      return true
    }

    if (item.link === `${location.pathname}#${activeItemHash}`) {
      return true
    }
  }

  if (linkMatchesPathname && !location.hash && activeItemHashFalsy) {
    return true
  }

  if (item.link === `${location.pathname}${location.hash}` && !activeItemHash) {
    return true
  }

  if (linkMatchesPathname && !location.hash && !activeItemHash) {
    return true
  }

  return false
}

const getActiveItem = (sectionList, location, activeItemHash) => {
  if (sectionList.items) {
    for (let item of sectionList.items) {
      if (isItemActive(location, item, activeItemHash)) {
        return item.link
      }
      if (item.subitems) {
        for (let subitem of item.subitems) {
          if (isItemActive(location, subitem, activeItemHash)) {
            return subitem.link
          }
        }
      }
    }
  } else {
    if (isItemActive(location, sectionList, activeItemHash)) {
      return sectionList.link
    }
  }

  return false
}

export default getActiveItem
