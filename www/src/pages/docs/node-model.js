import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import { sortBy } from "lodash-es"

import APIReference from "../../components/api-reference"
import { rhythm } from "../../utils/typography"
import { space } from "../../utils/presets"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class NodeModelDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    ).filter(func => !func.type) // Filter out @typedef
    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Node Model</title>
            <meta
              name="description"
              content="Documentation explaining the model of nodes in Gatsby's GraphQL data layer"
            />
          </Helmet>
          <h1 id="node-model" css={{ marginTop: 0 }}>
            Node Model
          </h1>
          <p>
            Gatsby exposes its internal data store and query capabilities to
            GraphQL field resolvers on <code>context.nodeModel</code>.
          </p>
          <h3>Example usage</h3>
          <div className="gatsby-code-title">gatsby-node.js</div>
          <div className="gatsby-highlight">
            <pre
              className="language-javascript"
              dangerouslySetInnerHTML={{
                __html:
                  `<code class="language-javascript">\n` +
                  `<span class="token function">createResolvers</span><span class="token punctuation">(</span><span class="token punctuation">{</span>\n` +
                  `  Query<span class="token punctuation">:</span> <span class="token punctuation">{</span>\n` +
                  `    mood<span class="token punctuation">:</span> <span class="token punctuation">{</span>\n` +
                  `      type<span class="token punctuation">:</span> <span class="token template-string"><span class="token string">\`String\`</span></span><span class="token punctuation">,</span>\n` +
                  `      <span class="token function">resolve</span><span class="token punctuation">(</span><span class="token parameter">source<span class="token punctuation">,</span> args<span class="token punctuation">,</span> context<span class="token punctuation">,</span> info</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>\n` +
                  `        <span class="token keyword">const</span> coffee <span class="token operator">=</span> context<span class="token punctuation">.</span>nodeModel<span class="token punctuation">.</span><span class="token function">getAllNodes</span><span class="token punctuation">(</span><span class="token punctuation">{</span> type<span class="token punctuation">:</span> <span class="token template-string"><span class="token string">\`Coffee\`</span></span> <span class="token punctuation">}</span><span class="token punctuation">)</span>\n` +
                  `        <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token operator">!</span>coffee<span class="token punctuation">.</span>length<span class="token punctuation">)</span> <span class="token punctuation">{</span>\n` +
                  `          <span class="token keyword">return</span> 😞\n` +
                  `        <span class="token punctuation">}</span>\n` +
                  `        <span class="token keyword">return</span> 😊\n` +
                  `      <span class="token punctuation">}</span><span class="token punctuation">,</span>\n` +
                  `    <span class="token punctuation">}</span><span class="token punctuation">,</span>\n` +
                  `  <span class="token punctuation">}</span><span class="token punctuation">,</span>\n` +
                  `<span class="token punctuation">}</span><span class="token punctuation">)</span>\n` +
                  `</code>`,
              }}
            />
          </div>
          <hr />
          <h2 css={{ marginBottom: rhythm(space[3]) }}>Methods</h2>
          <ul>
            {funcs.map((node, i) => (
              <li key={`function list ${node.name}`}>
                <a href={`#${node.name}`}>{node.name}</a>
              </li>
            ))}
          </ul>
          <hr />
          <h2>Reference</h2>
          <APIReference docs={funcs} />
        </Container>
      </Layout>
    )
  }
}

export default NodeModelDocs

export const pageQuery = graphql`
  query {
    file(relativePath: { eq: "gatsby/src/schema/node-model.js" }) {
      childrenDocumentationJs {
        name
        ...DocumentationFragment
      }
    }
  }
`
