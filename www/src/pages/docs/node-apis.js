import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"

class NodeAPIDocs extends React.Component {
  render() {
    return (
      <div>
        <h1>Gatsby Node APIs</h1>
        <p>
          Gatsby gives plugins and site builders many APIs
          for controlling your site.
        </p>
        <h2 css={{ marginBottom: rhythm(1 / 2) }}>APIs</h2>
        <ul css={{ ...scale(-1 / 5) }}>
          {this.props.data.allDocumentationJs.edges.map(({ node }, i) =>
            <li key={`function list ${node.name}`}>
              <a href={`#${node.name}`}>{node.name}</a>
            </li>
          )}
        </ul>
        <br />
        <hr />
        <h2>Reference</h2>
        <Functions functions={this.props.data.allDocumentationJs.edges} />
      </div>
    )
  }
}

export default NodeAPIDocs

export const pageQuery = graphql`
query APINodeDocsQuery {
  allDocumentationJs(id: {regex: "/src.*api-node-docs.js/"}, sortBy: {fields: [name]}) {
    edges {
      node {
        name
        ...FunctionList
      }
    }
  }
}
`
