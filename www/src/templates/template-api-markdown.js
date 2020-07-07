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
  const { prev, next } = pageContext
  const page = data.docPage
  const heading = page.contentsHeading || `APIs`
  const headingId = `apis`

  // Cleanup graphql data for usage with API rendering components
  const mergedFuncs = mergeFunctions(data, pageContext)

  // Generate table of content items for API entries
  const items = page.tableOfContents.items || []
  const tableOfContentsItems = [
    ...items,
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
  ]
  const tableOfContentsDepth = Math.max(page.tableOfContentsDepth, 2)

  return (
    <DocsMarkdownPage
      page={page}
      location={location}
      prev={prev}
      next={next}
      tableOfContentsItems={tableOfContentsItems}
      tableOfContentsDepth={tableOfContentsDepth}
    >
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
      relativePath
      slug
      body
      excerpt
      timeToRead
      tableOfContents
      anchor
      title
      description
      contentsHeading
      showTopLevelSignatures
      disableTableOfContents
      tableOfContentsDepth
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
