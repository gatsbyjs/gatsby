import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class BrowserAPIDocs extends React.Component {
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Gatsby Browser APIs</h1>
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

export default BrowserAPIDocs

export const pageQuery = graphql`
  query BrowserAPIDocsQuery {
    allDocumentationJs(
      filter: { id: { regex: "/src.*api-browser-docs.js/" } },
      sort: { fields: [name] },
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
