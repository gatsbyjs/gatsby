import React from "react"
import { graphql, Link } from "gatsby"
import { Helmet } from "react-helmet"
import { sortBy } from "lodash-es"

import APIReference from "../../components/api-reference"
import { space } from "../../utils/presets"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"
import normalizeGatsbyApiCall from "../../utils/normalize-gatsby-api-call"

class NodeAPIDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    )

    const normalized = normalizeGatsbyApiCall(this.props.data.nodeAPIs.group)

    const mergedFuncs = funcs.map(func => {
      return {
        ...func,
        ...normalized.find(n => n.name === func.name),
      }
    })

    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Node APIs</title>
            <meta
              name="description"
              content="Documentation on Node APIs used in Gatsby build process for common uses like creating pages"
            />
          </Helmet>
          <h1 id="gatsby-node-apis" css={{ marginTop: 0 }}>
            Gatsby Node APIs
          </h1>
          <p>
            Gatsby gives plugins and site builders many APIs for controlling
            your site's data in the GraphQL data layer.
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
                  __html: `<span class="token comment">// Promise API</span>
exports<span class="token punctuation">.</span><span class="token function-variable function">createPages</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">return</span> <span class="token keyword">new</span> <span class="token class-name">Promise</span><span class="token punctuation">(</span><span class="token punctuation">(</span>resolve<span class="token punctuation">,</span> reject<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
    <span class="token comment">// do async work</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

<span class="token comment">// Callback API</span>
exports<span class="token punctuation">.</span><span class="token function-variable function">createPages</span> <span class="token operator">=</span> <span class="token punctuation">(</span>_<span class="token punctuation">,</span> pluginOptions<span class="token punctuation">,</span> cb<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token comment">// do Async work</span>
  <span class="token function">cb</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>`,
                }}
              />
            </pre>
          </div>
          <p>
            If your plugin does not do async work, you can just return directly.
          </p>
          <hr />
          <h2 css={{ marginBottom: space[3] }}>Usage</h2>
          <p css={{ marginBottom: space[5] }}>
            Implement any of these APIs by exporting them from a file named
            {` `}
            <code>gatsby-node.js</code> in the root of your project.
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
          <APIReference docs={mergedFuncs} />
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
    nodeAPIs: allGatsbyApiCall(filter: { group: { eq: "NodeAPI" } }) {
      group(field: name) {
        ...ApiCallFragment
      }
    }
  }
`
