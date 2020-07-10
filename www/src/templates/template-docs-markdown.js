/** @jsx jsx */
import { jsx } from "theme-ui"
import { graphql } from "gatsby"

import DocsMarkdownPage from "../components/docs-markdown-page"

function DocsTemplate({ data, location }) {
  return <DocsMarkdownPage page={data.docPage} location={location} />
}

export default DocsTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    docPage(slug: { eq: $slug }) {
      ...DocPageContent
    }
  }
`
