import { keyBy } from "lodash-es"
import docsSidebar from "../../data/sidebars/doc-links.yaml"
import contributingSidebar from "../../data/sidebars/contributing-links.yaml"
import featuresSidebar from "../../data/sidebars/features-links.yaml"
import tutorialSidebar from "../../data/sidebars/tutorial-links.yaml"

import { useStaticQuery, graphql } from "gatsby"

import { getLocaleAndBasePath } from "../i18n"

function usePages() {
  const { allMdx } = useStaticQuery(graphql`
    query {
      allMdx(limit: 10000, filter: { fileAbsolutePath: { ne: null } }) {
        nodes {
          fields {
            locale
            slug
          }
          frontmatter {
            title
            navTitle
            breadcrumbTitle
          }
        }
      }
      tutorialHeadings: allMdx(
        limit: 10000
        filter: { fields: { slug: { glob: "/tutorial/part-*" } } }
      ) {
        nodes {
          fields {
            locale
            slug
          }
          headings {
            depth
            value
          }
        }
      }
    }
  `)
  // TODO maybe turn into an object
  return allMdx.nodes
}

const createHash = link => {
  let index = -1
  if (link) index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : false
}

const extendItem = (items, parentTitle, pages, level = 1) => {
  return items.map(_item => {
    const item = {
      ..._item,
      hash: createHash(_item.link),
      parentTitle,
      level,
    }

    if (!item.title) {
      const { title, navTitle, breadcrumbTitle } = pages[item.link].frontmatter
      item.title = navTitle || title
      item.breadcrumbTitle = breadcrumbTitle || navTitle || title
    }

    if (item.items) {
      item.items = extendItem(item.items, item.title, pages, item.level + 1)
    }
    return item
  })
}

const extendItemList = (itemList, pages) => {
  return itemList.map(_section => {
    const section = {
      ..._section,
      level: 0,
    }

    if (!section.title) {
      const { title, navTitle, breadcrumbTitle } = pages[
        section.link
      ].frontmatter
      section.title = navTitle || title
      section.breadcrumbTitle = breadcrumbTitle || navTitle || title
    }

    if (section.items) {
      section.items = extendItem(section.items, section.title, pages)
    }
    return section
  })
  // return itemList
}

const extendSidebarData = (item, pages) => {
  return {
    title: item[0].title,
    breadcrumbTitle: item[0].breadcrumbTitle,
    key: item[0].key,
    disableExpandAll: item[0].disableExpandAll,
    disableAccordions: item[0].disableAccordions,
    items: extendItemList(item[0].items, pages),
  }
}

function useItemLists() {
  const locale = "en" // FIXME get from useIntl()
  const pages = usePages()
  const localPages = pages.filter(page => page.fields.locale === locale)
  const pagesMap = keyBy(localPages, "fields.slug")

  return {
    docs: extendSidebarData(docsSidebar, pagesMap),
    contributing: extendSidebarData(contributingSidebar, pagesMap),
    tutorial: extendSidebarData(tutorialSidebar, pagesMap),
    features: extendSidebarData(featuresSidebar, pagesMap),
  }
}

function useItemList(path) {
  const { basePath } = getLocaleAndBasePath(path)
  const [urlSegment] = basePath.split("/").slice(1)
  const itemLists = useItemLists()
  return itemLists[urlSegment]
}

export { useItemList }
