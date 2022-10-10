import * as React from "react"
import { graphql } from "gatsby"

const PageTwo = ({ data }) => (
  <main>
    <h1>Page 2</h1>
    <p>{data.site.siteMetadata.author}</p>
  </main>
)

export default PageTwo

export const query = graphql`
  query {
    site {
      siteMetadata {
        author
      }
    }
  }
`

export const Head = () => <title>Page 2 - Gatsby Default Starter</title>
