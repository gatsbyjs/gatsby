import docsSidebar from "../../data/sidebars/doc-links.yaml"
import featuresSidebar from "../../data/sidebars/features-links.yaml"
import tutorialSidebar from "../../data/sidebars/tutorial-links.yaml"

const createHash = link => {
  let index = -1
  if (link) index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : false
}

const extendSectionList = sectionList => {
  sectionList.forEach(section => {
    if (section.items) extendItem(section.items, section.title)
  })
  return sectionList
}

const extendItem = (items, parentTitle) => {
  items.forEach(item => {
    item.hash = createHash(item.link)
    item.parentTitle = parentTitle
    if (item.items) extendItem(item.items, item.title)
  })
}

const sectionListDocs = extendSectionList(docsSidebar).map(item => {
  return { ...item }
})

const sectionListFeatures = extendSectionList(featuresSidebar).map(item => {
  return { ...item, disableAccordions: true }
})

const sectionListTutorial = extendSectionList(tutorialSidebar).map(item => {
  return { ...item, disableAccordions: true }
})

export { sectionListDocs, sectionListFeatures, sectionListTutorial }
