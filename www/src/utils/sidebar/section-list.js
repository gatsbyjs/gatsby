import docsSidebar from "../../data/sidebars/doc-links.yaml"
import featuresSidebar from "../../data/sidebars/features-links.yaml"
import tutorialSidebar from "../../data/sidebars/tutorial-links.yaml"

const createId = link => {
  const index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : false
}

const extendSectionList = sectionList => {
  sectionList.forEach(section => {
    if (section.items) {
      section.items.forEach((item, index) => {
        let parent = index
        item.hash = createId(item.link)
        if (item.subitems) {
          item.subitems.forEach(subitem => {
            subitem.hash = createId(subitem.link)
            subitem.parentLink = section.items[parent].link
          })
        }
      })
    }
  })

  return sectionList
}

const sectionListDocs = extendSectionList(docsSidebar).map(item => {
  return {
    ...item,
    directory: `docs`,
  }
})

const sectionListFeatures = extendSectionList(featuresSidebar).map(item => {
  return {
    ...item,
    directory: `features`,
    disableAccordions: true,
  }
})

const sectionListTutorial = extendSectionList(tutorialSidebar).map(item => {
  return {
    ...item,
    directory: `tutorial`,
  }
})

export { sectionListDocs, sectionListFeatures, sectionListTutorial }
