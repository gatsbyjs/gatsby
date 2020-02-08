import { useContext } from "react"
import { LocaleContext } from "../../components/layout"
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
            # breadcrumbTitle // Add back in when docs are converted
            issue
          }
        }
      }
    }
  `)
  return allMdx.nodes
}

const createHash = link => {
  let index = -1
  if (link) index = link.indexOf(`#`)
  return index >= 0 ? link.substr(index + 1) : false
}

const extendItems = (items, pages, level = 0, parentTitle) => {
  return items.map(_item => {
    if (typeof _item === "string") {
      _item = { link: _item }
    }
    const item = {
      ..._item,
      hash: createHash(_item.link),
      parentTitle,
      level,
    }

    if (pages[item.link]) {
      const { title, navTitle, breadcrumbTitle, issue } = pages[
        item.link
      ].frontmatter

      if (issue) {
        item.stub = true
      }

      if (!item.title) {
        item.title = navTitle || title
        item.breadcrumbTitle = breadcrumbTitle || navTitle || title
      }
    }

    if (item.items) {
      item.items = extendItems(item.items, pages, item.level + 1, item.title)
    }
    return item
  })
}

const extendSidebarData = (item, pages) => {
  return {
    title: item[0].title,
    breadcrumbTitle: item[0].breadcrumbTitle,
    key: item[0].key,
    disableExpandAll: item[0].disableExpandAll,
    disableAccordions: item[0].disableAccordions,
    items: extendItems(item[0].items, pages),
  }
}

function useItemLists() {
  const locale = useContext(LocaleContext)
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

export { useItemLists, useItemList }
