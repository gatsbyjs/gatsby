import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import { sortBy } from "lodash-es"

import APIReference from "../../components/api-reference"
import { space } from "../../utils/presets"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class BrowserAPIDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs.filter(
        doc => doc.kind !== `typedef`
      ),
      func => func.name
    )

    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Browser APIs</title>
            <meta
              name="description"
              content="Documentation about leveraging standard browser APIs within Gatsby"
            />
          </Helmet>
          <h1 id="browser-apis" css={{ marginTop: 0 }}>
            Gatsby Browser APIs
          </h1>
          <h2 css={{ marginBottom: space[3] }}>Usage</h2>
          <p css={{ marginBottom: space[5] }}>
            Implement any of these APIs by exporting them from a file named
            {` `}
            <code>gatsby-browser.js</code> in the root of your project.
          </p>
          <hr />
          <h2 css={{ marginBottom: space[3] }}>APIs</h2>
          <ul>
            {funcs.map(node => (
              <li key={`function list ${node.name}`}>
                <a href={`#${node.name}`}>{node.name}</a>
              </li>
            ))}
          </ul>
          <br />
          <hr />
          <h2>Reference</h2>
          <APIReference docs={funcs} showTopLevelSignatures={true} />
        </Container>
      </Layout>
    )
  }
}

export default BrowserAPIDocs

export const pageQuery = graphql`
  query {
    file(relativePath: { regex: "/src.*api-browser-docs.js/" }) {
      childrenDocumentationJs {
        name
        ...DocumentationFragment
      }
    }
  }
`
