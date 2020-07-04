/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"

import DocsMarkdownPage from "../components/docs-markdown-page"

function DocsTemplate({ data, location, pageContext: { next, prev } }) {
  const page = data.docPage

  return (
    <DocsMarkdownPage page={page} location={location} prev={prev} next={next}>
      {page.issue && (
        <a href={page.issue} target="_blank" rel="noopener noreferrer">
          See the issue relating to this stub on GitHub
        </a>
      )}
    </DocsMarkdownPage>
  )
}

export default DocsTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    docPage(slug: { eq: $slug }) {
      relativePath
      slug
      body
      excerpt
      timeToRead
      tableOfContents
      anchor
      title
      description
      issue
      disableTableOfContents
      tableOfContentsDepth
    }
  }
`
