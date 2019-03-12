import React from "react"
import { graphql, Link } from "gatsby"
import Helmet from "react-helmet"
import sortBy from "lodash/sortBy"

import APIReference from "../../components/api-reference"
import { rhythm, scale } from "../../utils/typography"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class NodeAPIHelperDocs extends React.Component {
  render() {
    const docs = sortBy(
      this.props.data.allDocumentationJs.edges.map(({ node }) => node),
      docs => docs.name
    )
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Node API helpers</title>
          </Helmet>
          <h1 id="gatsby-node-helpers-apis" css={{ marginTop: 0 }}>
            Gatsby Node API helpers
          </h1>
          <p>
            The first argument passed to each of{` `}
            <Link to="/docs/node-apis/">Gatsby's Node APIs</Link> is an object
            containing a set of utilities. Utilities shared by all Gatsby's Node
            APIs are documented below. Some APIs provide additional utilities.
            For example:
          </p>
          <ul>
            <li>
              <Link to="/docs/node-apis/#createPages">
                <code>createPages</code>
              </Link>
              {` `}
              provides <code>graphql</code> function.
            </li>
            <li>
              <Link to="/docs/node-apis/#onCreateWebpackConfig">
                <code>onCreateWebpackConfig</code>
              </Link>
              {` `}
              provides <code>stage</code>, <code>getConfig</code>,{` `}
              <code>rules</code>, <code>loaders</code>,{` `}
              <code>plugins</code> fields.
            </li>
          </ul>
          <h2>Examples</h2>
          <div className="gatsby-highlight">
            <pre className="language-javascript">
              <code
                className="language-javascript"
                dangerouslySetInnerHTML={{
                  __html: `
// in gatsby-node.js
exports.createPages = gatsbyNodeHelpers => {
  const { actions, reporter } = gatsbyNodeHelpers
  // use helpers
}
              `.trim(),
                }}
              />
            </pre>
          </div>
          <p>
            Common convention is to destructure helpers right in argument list:
          </p>
          <div className="gatsby-highlight">
            <pre className="language-javascript">
              <code
                className="language-javascript"
                dangerouslySetInnerHTML={{
                  __html: `
// in gatsby-node.js
exports.createPages = ({ actions, reporter }) => {
  // use helpers
}
              `.trim(),
                }}
              />
            </pre>
          </div>
          <h2 css={{ marginBottom: rhythm(1 / 2) }}>Helpers</h2>
          <ul css={{ ...scale(-1 / 5) }}>
            {docs.map((node, i) => (
              <li key={`function list ${node.name}`}>
                <a href={`#${node.name}`}>{node.name}</a>
              </li>
            ))}
          </ul>
          <br />
          <hr />
          <h2>Reference</h2>
          <APIReference docs={docs} showTopLevelSignatures={true} />
        </Container>
      </Layout>
    )
  }
}

export default NodeAPIHelperDocs

export const pageQuery = graphql`
  query {
    allDocumentationJs(filter: { memberof: { eq: "GatsbyNodeHelpers" } }) {
      edges {
        node {
          name
          ...DocumentationFragment
        }
      }
    }
  }
`
