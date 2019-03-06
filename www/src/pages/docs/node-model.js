import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import sortBy from "lodash/sortBy"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class NodeModelDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    )
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Node Model</title>
          </Helmet>
          <h1 id="node-model" css={{ marginTop: 0 }}>
            Node Model
          </h1>
          <p>
            Gatsby exposes its internal data store and query capabilities to
            GraphQL field resolvers on <code>context.nodeModel</code>.
          </p>
          <hr />
          <h2 css={{ marginBottom: rhythm(1 / 2) }}>Methods</h2>
          <ul css={{ ...scale(-1 / 5) }}>
            {funcs.map((node, i) => (
              <li key={`function list ${node.name}`}>
                <a href={`#${node.name}`}>{node.name}</a>
              </li>
            ))}
          </ul>
          <br />
          <hr />
          <h2>Reference</h2>
          <Functions functions={funcs} />
        </Container>
      </Layout>
    )
  }
}

export default NodeModelDocs

export const pageQuery = graphql`
  query {
    file(relativePath: { regex: "/src.*node-model.js/" }) {
      childrenDocumentationJs {
        name
        ...FunctionList
      }
    }
  }
`
