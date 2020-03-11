/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Helmet } from "react-helmet"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import PageWithSidebar from "../components/page-with-sidebar"
import MarkdownPageFooter from "../components/markdown-page-footer"
import DocSearchContent from "../components/docsearch-content"
import TableOfContents from "../components/docs-table-of-contents"
import FooterLinks from "../components/shared/footer-links"
import Breadcrumb from "../components/docs-breadcrumb"
import Container from "../components/container"
import PrevAndNext from "../components/prev-and-next"

const containerStyles = {
  // we need to account for <Container>'s horizontal padding of
  // `space[6]` each (1.5rem), plus add a fluffy `space[9]`
  // of whitespace in between main content and TOC
  //
  // could be much cleaner/clearer, please feel free to improve 🙏
  maxWidth: t =>
    `calc(${t.sizes.mainContentWidth.withSidebar} + ${t.sizes.tocWidth} + ${t.space[9]} + ${t.space[9]} + ${t.space[9]})`,
  px: 9,
}

function DocsTemplate({ data, location, pageContext: { next, prev } }) {
  const page = data.mdx
  const [urlSegment] = page.fields.slug.split(`/`).slice(1)
  const toc =
    !page.frontmatter.disableTableOfContents && page.tableOfContents.items

  const description = page.frontmatter.description || page.excerpt

  return (
    <PageWithSidebar
      location={location}
      enableScrollSync={urlSegment === "tutorial"}
    >
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
            [toc && mediaQueries.xl]: {
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
            [toc && mediaQueries.xl]: {
              ...containerStyles,
              display: `flex`,
              alignItems: `flex-start`,
            },
          }}
        >
          {toc && (
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
              <TableOfContents location={location} page={page} />
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
            <div>
              <MDXRenderer slug={page.fields.slug}>{page.body}</MDXRenderer>
              {page.frontmatter.issue && (
                <a
                  href={page.frontmatter.issue}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  See the issue relating to this stub on GitHub
                </a>
              )}
              <MarkdownPageFooter page={page} />
              <PrevAndNext sx={{ mt: 9 }} prev={prev} next={next} />
            </div>
          </div>
        </Container>
      </DocSearchContent>
      <FooterLinks />
    </PageWithSidebar>
  )
}

export default DocsTemplate

export const pageQuery = graphql`
  query($slug: String!, $locale: String!) {
    mdx(fields: { slug: { eq: $slug }, locale: { eq: $locale } }) {
      body
      excerpt
      timeToRead
      tableOfContents
      fields {
        slug
        locale
        anchor
      }
      frontmatter {
        title
        description
        overview
        issue
        disableTableOfContents
        tableOfContentsDepth
      }
      ...MarkdownPageFooterMdx
    }
  }
`
