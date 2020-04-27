/** @jsx jsx */
import { jsx } from "theme-ui"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

// API Rendering Stuff
import { sortBy } from "lodash-es"

import PageWithSidebar from "../components/page-with-sidebar"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"
import FooterLinks from "../components/shared/footer-links"
import Breadcrumb from "../components/docs-breadcrumb"
import Container from "../components/container"
import PrevAndNext from "../components/prev-and-next"
import APIReference from "../components/api-reference"
import TableOfContents from "../components/docs-table-of-contents"

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
      .filter(def => def.kind !== `typedef` && def.memberof)
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

const containerStyles = {
  maxWidth: t =>
    `calc(${t.sizes.mainContentWidth.withSidebar} + ${t.sizes.tocWidth} + ${t.space[9]} + ${t.space[9]} + ${t.space[9]})`,
  px: 9,
}

export default function APITemplate({ data, location, pageContext }) {
  const { next, prev } = pageContext
  const page = data.mdx

  // Cleanup graphql data for usage with API rendering components
  const mergedFuncs = mergeFunctions(data, pageContext)
  const description = page.frontmatter.description || page.excerpt

  const getAPIItems = () => {
    return {
      title: "APIs",
      url: '#APIs',
      items: mergedFuncs.map(item => ({
        url: `#${item.name}`,
        title: item.name
      }))
    };
  }

  const getTOCItems = () => {
    if (page.frontmatter.disableTableOfContents) {
      return []
    }

    return [...page.tableOfContents.items, getAPIItems()]
  }

  const getTOCDepth = () => {
    return Math.max(page.frontmatter.tableOfContentsDepth, 2)
  }

  const items = getTOCItems();
  const depth = getTOCDepth();
  const isTOCVisible = items.length > 0;

  return (
    <PageWithSidebar location={location}>
      <Helmet>
        <title>{page.frontmatter.title}</title>
        <meta name="description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:title" content={page.frontmatter.title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter.label1" content="Reading time" />
        <meta name="twitter:data1" content={`${page.timeToRead} min read`} />
      </Helmet>
      <DocSearchContent>
        <Container
          overrideCSS={{
            pb: 0,
            [mediaQueries.lg]: {
              pt: 9,
            },
            [isTOCVisible && mediaQueries.xl]: {
              ...containerStyles,
            },
          }}
        >
          <Breadcrumb location={location} />
          <h1 id={page.fields.anchor} sx={{ mt: 0 }}>
            {page.frontmatter.title}
          </h1>
        </Container>
        <Container
          overrideCSS={{
            pt: 0,
            position: `static`,
            [mediaQueries.lg]: {
              pb: 9,
            },
            [isTOCVisible && mediaQueries.xl]: {
              ...containerStyles,
              display: `flex`,
              alignItems: `flex-start`,
            },
          }}
        >
          {isTOCVisible && (
            <div
              sx={{
                order: 2,
                [mediaQueries.xl]: {
                  ml: 9,
                  maxWidth: `tocWidth`,
                  position: `sticky`,
                  top: t =>
                    `calc(${t.sizes.headerHeight} + ${t.sizes.bannerHeight} + ${t.space[9]})`,
                  maxHeight: t =>
                    `calc(100vh - ${t.sizes.headerHeight} - ${t.sizes.bannerHeight} - ${t.space[9]} - ${t.space[9]})`,
                  overflow: `auto`,
                },
              }}
            >
              <TableOfContents
                items={items}
                location={location}
                depth={depth}
              />
            </div>
          )}
          <div
            sx={{
              [page.tableOfContents.items && mediaQueries.xl]: {
                maxWidth: `mainContentWidth.withSidebar`,
                minWidth: 0,
              },
            }}
          >
            <MDXRenderer slug={page.fields.slug}>{page.body}</MDXRenderer>
            <h2 id="APIs">{page.frontmatter.contentsHeading || "APIs"}</h2>
            <APIReference
              docs={mergedFuncs}
              showTopLevelSignatures={page.frontmatter.showTopLevelSignatures}
            />
            <PrevAndNext sx={{ mt: 9 }} prev={prev} next={next} />
            <MarkdownPageFooter page={page} />
          </div>
        </Container>
      </DocSearchContent>
      <FooterLinks />
    </PageWithSidebar>
  )
}

export const pageQuery = graphql`
  query($path: String!, $jsdoc: [String], $apiCalls: String) {
    mdx(fields: { slug: { eq: $path } }) {
      body
      excerpt
      timeToRead
      tableOfContents
      fields {
        slug
        anchor
      }
      frontmatter {
        title
        description
        contentsHeading
        showTopLevelSignatures
        disableTableOfContents
        tableOfContentsDepth
      }
      ...MarkdownPageFooterMdx
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
