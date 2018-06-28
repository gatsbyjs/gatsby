import getSlugId from "./get-slug-id"

const isItemActive = (location, item, directory, slugId, activeItemHash) => {
  if (activeItemHash) {
    if (
      activeItemHash === `NONE` &&
      `/${directory}/${getSlugId(item.link)}/` === `${location.pathname}`
    ) {
      return true
    }

    if (
      `/${directory}${item.link}` === `${location.pathname}#${activeItemHash}`
    ) {
      return true
    }
  }

  if (item.link === `/` && slugId === directory) {
    return true
  }

  if (
    `/${directory}${item.link}` === `${location.pathname}${location.hash}` &&
    !activeItemHash
  ) {
    return true
  }

  return false
}

const getActiveItem = (sectionList, location, activeItemHash) => {
  const directory = sectionList.directory
  const slugId = getSlugId(location.pathname)

  for (let item of sectionList.items) {
    if (isItemActive(location, item, directory, slugId, activeItemHash)) {
      return item.link
    }
    if (item.subitems) {
      for (let subitem of item.subitems) {
        if (
          isItemActive(location, subitem, directory, slugId, activeItemHash)
        ) {
          return subitem.link
        }
      }
    }
  }

  return false
}

export default getActiveItem
