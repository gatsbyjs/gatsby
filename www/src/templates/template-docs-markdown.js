/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"

import DocsMarkdownPage from "../components/docs-markdown-page"

function DocsTemplate({ data, location, pageContext: { next, prev } }) {
  const page = data.mdx
  const { frontmatter } = page

  return (
    <DocsMarkdownPage
      page={page}
      location={location}
      prev={prev}
      next={next}
    >
      {frontmatter.issue && (
        <a
          href={page.frontmatter.issue}
          target="_blank"
          rel="noopener noreferrer"
        >
          See the issue relating to this stub on GitHub
        </a>
      )}
    </DocsMarkdownPage>
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
