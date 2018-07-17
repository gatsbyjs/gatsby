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
  for (let item of sectionList) {
    if (item.items) {
      for (let subitem of item.items) {
        if (isItemActive(location, subitem, activeItemHash)) {
          return subitem.link
        }
        if (subitem.items) {
          for (let subsubitem of subitem.items) {
            if (isItemActive(location, subsubitem, activeItemHash)) {
              return subsubitem.link
            }
          }
        }
      }
    } else {
      if (isItemActive(location, item, activeItemHash)) {
        return item.link
      }
    }
  }

  return false
}

export default getActiveItem
