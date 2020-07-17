/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"

import DocsMarkdownPage from "../components/docs-markdown-page"

function DocsTemplate({ data, location, pageContext: { next, prev } }) {
  return (
    <DocsMarkdownPage
      page={data.docPage}
      location={location}
      prev={prev}
      next={next}
    />
  )
}

export default DocsTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    docPage(slug: { eq: $slug }) {
      ...DocPageContent
    }
  }
`
