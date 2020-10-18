import { graphql, PageProps } from "gatsby"
import * as React from "react"
import Layout from "../components/layout"
import Source from "../components/source"

// Please note that you can use https://github.com/dotansimha/graphql-code-generator
// to generate all types from graphQL schema
interface IndexPageProps extends PageProps {
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

export default class IndexPage extends React.Component<IndexPageProps> {
  readonly hello = `Hello`
  public render() {
    const { siteName } = this.props.data.site.siteMetadata
    return (
      <Layout>
        <h1>{this.hello} TypeScript world!</h1>
        <p>
          This site is named <strong>{siteName}</strong>
        </p>
        <Source description="Interested in details of this site?" />
      </Layout>
    )
  }
}
