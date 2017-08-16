import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class NodeAPIDocs extends React.Component {
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Gatsby Node APIs</h1>
        <p>
          Gatsby gives plugins and site builders many APIs for controlling your
          site.
        </p>
        <h3>Async plugins</h3>
        <p>
          If your plugin performs async operations (disk I/O, database access,
          calling remote APIs, etc.) you must either return a promise or use the
          callback passed to the 3rd argument. Gatsby needs to know when plugins
          are finished as some APIs, to work correctly, require previous APIs to
          be complete first.
        </p>
        <pre>
          <code
            className="language-javascript"
            dangerouslySetInnerHTML={{
              __html: `// Promise API
exports.createPages = () => {
  return new Promise((resolve, reject) => {
    // do async work
  })
}

// Callback API
exports.createPages = (_, pluginOptions, cb) => {
  // do Async work
  cb()
}`,
            }}
          />
        </pre>
        <p>
          If your plugin doesn't do async work, you can just return directly.
        </p>
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

export default NodeAPIDocs

export const pageQuery = graphql`
  query APINodeDocsQuery {
    allDocumentationJs(
      filter: { id: { regex: "/src.*api-node-docs.js/" } }
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
