import getSlugId from "./get-slug-id"

const findSectionForPath = (pathname, sections) => {
  const slugId = getSlugId(pathname)
  let activeSection

  sections.forEach(section => {
    const match = section.items.some(
      item =>
        `/${section.directory}${item.link}` === pathname ||
        slugId === item.id ||
        (item.link === `/` && slugId === section.directory) ||
        (item.subitems && item.subitems.some(subitem => slugId === subitem.id))
    )
    if (match) {
      activeSection = section
    }
  })

  return activeSection || sections[0]
}

export default findSectionForPath
