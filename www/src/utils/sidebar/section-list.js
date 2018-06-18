import slugify from "slugify"

import docsSidebar from "../../pages/docs/doc-links.yaml"
import featuresSidebar from "../../pages/docs/features-links.yaml"
import tutorialSidebar from "../../pages/docs/tutorial-links.yml"

const createId = link => {
  const index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : slugify(link)
}

const setParent = (items, createIds) => {
  items.forEach(section => {
    if (section.items) {
      section.items.forEach((item, index) => {
        let foo = index
        if (createIds) {
          item.id = createId(item.link)
        }
        if (item.subitems) {
          item.subitems.forEach(subitem => {
            if (createIds) {
              subitem.id = createId(subitem.link)
            }
            subitem.parentId = section.items[foo].id
          })
        }
      })
    }
  })

  return items
}

const sectionListDocs = setParent(docsSidebar, true).map(item => {
  return {
    ...item,
    directory: `docs`,
  }
})

const sectionListFeatures = setParent(featuresSidebar, true).map(item => {
  return {
    ...item,
    directory: `features`,
    disableAccordions: true,
  }
})

const sectionListTutorial = setParent(tutorialSidebar, true).map(item => {
  return {
    ...item,
    directory: `tutorial`,
  }
})

export { sectionListDocs, sectionListFeatures, sectionListTutorial }
