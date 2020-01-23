import React from "react"
import { defaults } from "lodash-es"
import { useStaticQuery, graphql } from "gatsby"
import { LocaleContext } from "./layout"
import { defaultLang } from "../util/i18n"

export default function useLocalizedStrings(component) {
  const currentLocale = React.useContext(LocaleContext)

  const { allStringsYaml } = useStaticQuery(graphql`
    query {
      allStringsYaml {
        nodes {
          docsTableOfContents {
            title
          }
          markdownPageFooter {
            text
          }
          prevAndNext {
            prevLabel
            nextLabel
          }
          searchForm {
            placeholder
            ariaLabel
            title
          }
          sidebarButtonExpandAll {
            expandLabel
            collapseLabel
          }
        }
      }
    }
  `)
  const allDefaultStrings = allStringsYaml.nodes.find(
    ({ locale }) => locale === defaultLang
  )

  // Get all strings for the current language, or the default strings
  const allStrings =
    allStringsYaml.nodes.find(({ locale }) => locale === currentLocale) ||
    allDefaultStrings

  const strings = allStrings[component]
  const defaultStrings = allDefaultStrings[component]

  // FIXME this doesn't work bc graphql returns "null" and not "undefined"
  return defaults(strings, defaultStrings)
}
