import React from "react"
import { Link } from "gatsby"

import Layout from "../layouts"

class IndexPage extends React.Component {
  render() {
    return (
      <Layout>
        <ul>
          {this.props.data.allAsciidoc.edges.map(({ node }) => (
            <li>
              <Link to={node.slug}>{node.slug}</Link>
            </li>
          ))}
        </ul>
      </Layout>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
  query allAsciiPages {
    allAsciidoc {
      edges {
        node {
          id
          html
          slug
        }
      }
    }
  }
`
