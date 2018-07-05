const findSectionForPath = (pathname, sections) => {
  let activeSection

  sections.forEach(section => {
    if (section.items) {
      const match = section.items.some(
        item =>
          `${item.link}` === pathname ||
          (item.items && item.items.some(subitem => pathname === subitem.link))
      )
      if (match) {
        activeSection = section
      }
    }
  })

  return activeSection || sections[0]
}

export default findSectionForPath
