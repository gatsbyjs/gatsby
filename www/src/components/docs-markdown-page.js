/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

import PageWithSidebar from "../components/page-with-sidebar"
import PageMetadata from "../components/page-metadata"
import DocSearchContent from "../components/docsearch-content"
import TableOfContents from "../components/docs-table-of-contents"
import FooterLinks from "../components/shared/footer-links"
import Breadcrumb from "../components/docs-breadcrumb"
import Container from "../components/container"
import MarkdownPageFooter from "../components/markdown-page-footer"
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

export default function DocsMarkdownPage({
  page,
  location,
  prev,
  next,
  tableOfContentsItems = page.tableOfContents.items,
  tableOfContentsDepth = page.tableOfContentsDepth,
  children,
}) {
  const [urlSegment] = page.slug.split(`/`).slice(1)
  const description = page.description || page.excerpt
  const isTOCVisible =
    !page.disableTableOfContents && tableOfContentsItems?.length > 0

  return (
    <PageWithSidebar
      location={location}
      enableScrollSync={urlSegment === `tutorial`}
    >
      <PageMetadata
        title={page.title}
        description={description}
        type="article"
        timeToRead={page.timeToRead}
      />
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
          <h1 id={page.anchor} sx={{ mt: 0 }}>
            {page.title}
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
                items={tableOfContentsItems}
                depth={tableOfContentsDepth}
                location={location}
              />
            </div>
          )}
          <div
            sx={{
              [isTOCVisible && mediaQueries.xl]: {
                maxWidth: `mainContentWidth.withSidebar`,
                minWidth: 0,
              },
            }}
          >
            <div>
              <MDXRenderer slug={page.slug}>{page.body}</MDXRenderer>
              {children}
              <MarkdownPageFooter path={page.relativePath} />
              <PrevAndNext sx={{ mt: 9 }} prev={prev} next={next} />
            </div>
          </div>
        </Container>
      </DocSearchContent>
      <FooterLinks />
    </PageWithSidebar>
  )
}

export const docPageContentFragment = graphql`
  fragment DocPageContent on DocPage {
    relativePath
    slug
    body
    excerpt
    timeToRead
    tableOfContents
    anchor
    title
    description
    disableTableOfContents
    tableOfContentsDepth
  }
`
