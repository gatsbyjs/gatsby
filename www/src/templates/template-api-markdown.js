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
import APIReference, { APIContents } from "../components/api-reference"

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
          // so just remove it instead. Having one that returns nothing supresses
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
  const { next, prev } = pageContext
  const page = data.mdx

  // Cleanup graphql data for usage with API rendering components
  const mergedFuncs = mergeFunctions(data, pageContext)
  const description = page.frontmatter.description || page.excerpt

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
          }}
        >
          <div>
            <MDXRenderer slug={page.fields.slug}>{page.body}</MDXRenderer>
            <h2>{page.frontmatter.contentsHeading || "APIs"}</h2>
            <APIContents docs={mergedFuncs} />
            <h2>Reference</h2>
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
      fields {
        slug
        anchor
      }
      frontmatter {
        title
        description
        contentsHeading
        showTopLevelSignatures
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
