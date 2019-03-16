import React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"
import sortBy from "lodash/sortBy"

import APIReference from "../../components/api-reference"
import { rhythm } from "../../utils/typography"
import { space } from "../../utils/presets"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class NodeAPIDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    )
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Node APIs</title>
          </Helmet>
          <h1 id="gatsby-node-apis" css={{ marginTop: 0 }}>
            Gatsby Node APIs
          </h1>
          <p>
            Gatsby gives plugins and site builders many APIs for controlling
            your site.
          </p>
          <h3>Async plugins</h3>
          <p>
            If your plugin performs async operations (disk I/O, database access,
            calling remote APIs, etc.) you must either return a promise or use
            the callback passed to the 3rd argument. Gatsby needs to know when
            plugins are finished as some APIs, to work correctly, require
            previous APIs to be complete first. See
            {` `}
            <Link to="/docs/debugging-async-lifecycles/">
              Debugging Async Lifecycles
            </Link>
            {` `}
            for more info.
          </p>
          <div className="gatsby-highlight">
            <pre className="language-javascript">
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
          </div>
          <p>
            If your plugin does not do async work, you can just return directly.
          </p>
          <hr />
          <h2 css={{ marginBottom: rhythm(space[3]) }}>Usage</h2>
          <p css={{ marginBottom: rhythm(space[5]) }}>
            Implement any of these APIs by exporting them from a file named
            {` `}
            <code>gatsby-node.js</code> in the root of your project.
          </p>
          <hr />
          <h2 css={{ marginBottom: rhythm(space[3]) }}>APIs</h2>
          <ul>
            {funcs.map((node, i) => (
              <li key={`function list ${node.name}`}>
                <a href={`#${node.name}`}>{node.name}</a>
              </li>
            ))}
          </ul>
          <br />
          <hr />
          <h2>Reference</h2>
          <APIReference docs={funcs} />
        </Container>
      </Layout>
    )
  }
}

export default NodeAPIDocs

export const pageQuery = graphql`
  query {
    file(relativePath: { regex: "/src.*api-node-docs.js/" }) {
      childrenDocumentationJs {
        name
        ...DocumentationFragment
      }
    }
  }
`
