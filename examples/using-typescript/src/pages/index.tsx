import * as React from "react"
import Layout from "../layouts"
// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface IndexPageProps {
  data: {
    site: {
      siteMetadata: {
        siteName: string
      }
    }
  }
}

export const pageQuery = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        siteName
      }
    }
  }
`

export default ({ data }: IndexPageProps) => {
  const { siteName } = data.site.siteMetadata
  return (
    <Layout>
      <h1>Hello Typescript world!</h1>
      <p>
        This site is named <strong>{siteName}</strong>
      </p>
    </Layout>
  )
}
