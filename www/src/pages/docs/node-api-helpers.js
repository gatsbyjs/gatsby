/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql, Link } from "gatsby"
import Helmet from "react-helmet"
import { sortBy } from "lodash-es"

import APIReference from "../../components/api-reference"
import Layout from "../../components/layout"
import Container from "../../components/container"

class NodeAPIHelperDocs extends React.Component {
  render() {
    const docs = sortBy(
      this.props.data.allDocumentationJs.edges.map(({ node }) => node),
      docs => docs.name
    )
    return (
      <Layout location={this.props.location}>
        <Container>
          <Helmet>
            <title>Node API helpers</title>
            <meta
              name="description"
              content="Documentation on API helpers for creating nodes within Gatsby's GraphQL data layer"
            />
          </Helmet>
          <h1 id="gatsby-node-helpers-apis" sx={{ mt: 0 }}>
            Gatsby Node API helpers
          </h1>
          <p>
            The first argument passed to each of{` `}
            <Link to="/docs/node-apis/">Gatsby’s Node APIs</Link> is an object
            containing a set of helpers. Helpers shared by all Gatsby’s Node
            APIs are documented in{` `}
            <a href="#shared-helpers">Shared helpers</a> section.
          </p>
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
          <h2>Note</h2>
          <p>
            Some APIs provide additional helpers. For example{` `}
            <code>createPages</code> provides <code>graphql</code> function.
            Check documentation of specific APIs in{` `}
            <Link to="/docs/node-apis/">Gatsby Node APIs</Link> for details.
          </p>
          <h2 id="shared-helpers" sx={{ mb: 3 }}>
            Shared helpers
          </h2>
          <ul>
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
