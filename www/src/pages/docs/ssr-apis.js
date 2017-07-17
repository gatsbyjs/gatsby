import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class SSRAPIs extends React.Component {
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Gatsby Server Rendering APIs</h1>
        <h2 css={{ marginBottom: rhythm(1 / 2) }}>APIs</h2>
        <ul css={{ ...scale(-1 / 5) }}>
          {this.props.data.allDocumentationJs.edges.map(({ node }, i) =>
            <li key={`function list ${node.name}`}>
              <a href={`#${node.name}`}>
                {node.name}
              </a>
            </li>
          )}
        </ul>
        <br />
        <hr />
        <h2>Reference</h2>
        <Functions functions={this.props.data.allDocumentationJs.edges} />
      </Container>
    )
  }
}

export default SSRAPIs

export const pageQuery = graphql`
  query SSRAPIsQuery {
    allDocumentationJs(
      filter: { id: { regex: "/src.*api-ssr-docs.js/" } }
      sort: { fields: [name] }
    ) {
      edges {
        node {
          name
          ...FunctionList
        }
      }
    }
  }
`
