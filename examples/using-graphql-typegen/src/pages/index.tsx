import * as React from "react"
import { graphql, PageProps } from "gatsby"
import Info from "../components/info"
import "../layout.css"

const pageStyles = {
  maxWidth: `75ch`,
  margin: `0 auto`,
  padding: `2rem`,
}

const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  return (
    <main style={pageStyles}>
      <p>This page demonstrates on how you can use GraphQL Codegen in Gatsby. You can access the <code>Queries</code> global namespace to get query information.</p>
      <p>If you use VSCode or an IDE with a GraphQL language server you can also configure a <code>graphql.config.js</code> to get autocomplete inside the IDE when <code>gatsby develop</code> is running.</p>
      <p>Site title: {data.site?.siteMetadata.title}</p>
      <p>Description: {data.site?.siteMetadata.description}</p>
      <Info buildTime={data.site?.buildTime} />
      <hr />
      <p>Query Result:</p>
      <pre>
        <code>
          {JSON.stringify(data, null, 2)}
        </code>
      </pre>
    </main>
  )
}

export default IndexPage

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        description
      }
      ...SiteInformation
    }
  }
`
