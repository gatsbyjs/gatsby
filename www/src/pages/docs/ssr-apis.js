import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import sortBy from "lodash/sortBy"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class SSRAPIs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    )
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>SSR APIs</title>
          </Helmet>
          <h1 id="gatsby-server-rendering-apis" css={{ marginTop: 0 }}>
            Gatsby Server Rendering APIs
          </h1>
          <h2 css={{ marginBottom: rhythm(1 / 2) }}>Usage</h2>
          <p css={{ marginBottom: rhythm(1) }}>
            Implement any of these APIs by exporting them from a file named
            {` `}
            <code>gatsby-ssr.js</code> in the root of your project.
          </p>
          <hr />
          <h2 css={{ marginBottom: rhythm(1 / 2) }}>APIs</h2>
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

export default SSRAPIs

export const pageQuery = graphql`
  query {
    file(relativePath: { regex: "/api-ssr-docs.js/" }) {
      childrenDocumentationJs {
        name
        ...FunctionList
      }
    }
  }
`
