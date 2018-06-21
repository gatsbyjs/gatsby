import getSlugId from "./get-slug-id"

const toAnchor = (href = ``) => {
  const index = href.indexOf(`#`)
  return index >= 0 ? href.substr(index) : ``
}

const isItemActive = (location, item, directory, slugId) => {
  if (item.link === `/` && slugId === directory) {
    return true
  }

  if (location.hash) {
    return location.hash === toAnchor(item.link)
  }

  return item.id === slugId
}

const getActiveItem = (sectionList, location) => {
  const directory = sectionList.directory
  const slugId = getSlugId(location.pathname)

  for (let item of sectionList.items) {
    if (isItemActive(location, item, directory, slugId)) {
      return item.id
    }
    if (item.subitems) {
      for (let subitem of item.subitems) {
        if (isItemActive(location, subitem, directory, slugId)) {
          return subitem.id
        }
      }
    }
  }

  return false
}

export default getActiveItem
