import React from "react"
import { Link } from "gatsby"

class IndexPage extends React.Component {
  render() {
    console.log(this.props)
    return (
      <div>
        <ul>
          {this.props.data.allAsciidoc.edges.map(({ node }) => (
            <li>
              <Link to={node.slug}>{node.slug}</Link>
            </li>
          ))}
        </ul>
      </div>
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
