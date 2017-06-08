import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"

class SSRAPIs extends React.Component {
  render() {
    return (
      <div>
        <h1>Gatsby Server Rendering APIs</h1>
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

export default SSRAPIs

export const pageQuery = graphql`
query SSRAPIsQuery {
  allDocumentationJs(id: {regex: "/src.*api-ssr-docs.js/"}, sortBy: {fields: [name]}) {
    edges {
      node {
        name
        ...FunctionList
      }
    }
  }
}
`
