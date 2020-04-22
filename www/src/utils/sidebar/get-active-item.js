import { getLocaleAndBasePath } from "../i18n"

const isItemActive = (location, item, activeItemHash) => {
  const { basePath } = getLocaleAndBasePath(location.pathname)
  const linkMatchesPathname = item.link === basePath
  const linkWithoutHashMatchesPathname =
    item.link.replace(/#.*/, ``) === basePath
  const activeItemHashFalsy = !activeItemHash || activeItemHash === `NONE`

  if (activeItemHash) {
    if (activeItemHash === `NONE` && linkWithoutHashMatchesPathname) {
      return item
    }

    if (item.link === `${basePath}#${activeItemHash}`) {
      return item
    }
  }

  if (linkMatchesPathname && activeItemHashFalsy) {
    return item
  }

  if (item.link === `${basePath}${location.hash}` && !activeItemHash) {
    return item
  }

  if (linkMatchesPathname && !location.hash && !activeItemHash) {
    return item
  }

  return false
}

// find the current active item in the sidebar
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
