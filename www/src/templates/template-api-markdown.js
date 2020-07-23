/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import { sortBy } from "lodash-es"

import APIReference from "../components/api-reference"
import DocsMarkdownPage from "../components/docs-markdown-page"

const normalizeGatsbyApiCall = array =>
  array.map(entry => {
    const codeLocation =
      entry.nodes.length > 1
        ? entry.nodes.map(l => {
            return {
              file: l.file,
              start: { line: l.codeLocation.start.line },
              end: { line: l.codeLocation.end.line },
            }
          })
        : {
            file: entry.nodes[0].file,
            start: { line: entry.nodes[0].codeLocation.start.line },
            end: { line: entry.nodes[0].codeLocation.end.line },
          }

    return { name: entry.name, codeLocation }
  })

const mergeFunctions = (data, context) => {
  const normalized = normalizeGatsbyApiCall(data.nodeAPIs.group)

  const docs = data.jsdoc.nodes.reduce((acc, node) => {
    const doc = node.childrenDocumentationJs
      .filter(def => def.kind !== `typedef`)
      .map(def => {
        if (!context.apiCalls) {
          // When an api call list is not available, the line numbers from jsdoc
          // might be useful. Just for actions.mdx right now.
          def.codeLocation.file = node.relativePath
          if (!def.codeLocation.file) {
            def.codeLocation = null
          }
        } else {
          // API pages having apiCalls did not query for this in the page query,
          // so just remove it instead. Having one that returns nothing suppresses
          // documentation git links completely.
          def.codeLocation = null
        }
        return def
      })
    return acc.concat(doc)
  }, [])

  let funcs = sortBy(docs, func => func.name)

  const mergedFuncs = funcs.map(func => {
    return {
      ...func,
      ...normalized.find(n => n.name === func.name),
    }
  })

  return mergedFuncs
}

export default function APITemplate({ data, location, pageContext }) {
  const { docPage } = data
  const { prev, next } = pageContext
  const heading = docPage.contentsHeading || `APIs`
  const headingId = `apis`

  // Cleanup graphql data for usage with API rendering components
  const mergedFuncs = mergeFunctions(data, pageContext)

  // Override the page with updates to the table of contents
  const page = {
    ...docPage,
    tableOfContentsDepth: Math.max(docPage.tableOfContentsDepth, 2),
    tableOfContents: {
      ...docPage.tableOfContents,
      // Generate table of content items for API entries
      items: [
        ...(docPage.tableOfContents.items || []),
        {
          title: heading,
          url: `#${headingId}`,
          items: mergedFuncs.map(mergedFunc => {
            return {
              url: `#${mergedFunc.name}`,
              title: mergedFunc.name,
            }
          }),
        },
      ],
    },
  }

  return (
    <DocsMarkdownPage page={page} location={location} prev={prev} next={next}>
      <h2 id={headingId}>{heading}</h2>
      <APIReference
        docs={mergedFuncs}
        showTopLevelSignatures={page.showTopLevelSignatures}
      />
    </DocsMarkdownPage>
  )
}

export const pageQuery = graphql`
  query($path: String!, $jsdoc: [String], $apiCalls: String) {
    docPage(slug: { eq: $path }) {
      ...DocPageContent
      contentsHeading
      showTopLevelSignatures
    }
    jsdoc: allFile(filter: { relativePath: { in: $jsdoc } }) {
      nodes {
        relativePath
        childrenDocumentationJs {
          memberof
          name
          ...DocumentationFragment
          availableIn
          codeLocation {
            start {
              line
            }
            end {
              line
            }
          }
        }
      }
    }
    nodeAPIs: allGatsbyApiCall(filter: { group: { eq: $apiCalls } }) {
      group(field: name) {
        ...ApiCallFragment
      }
    }
  }
`
