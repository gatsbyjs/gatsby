/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { graphql } from "gatsby"
import { Helmet } from "react-helmet"
import { sortBy } from "lodash-es"

import APIReference from "../../components/api-reference"
import Layout from "../../components/layout"
import Container from "../../components/container"
import { itemListDocs } from "../../utils/sidebar/item-list"

class ActionCreatorsDocs extends React.Component {
  render() {
    const docs = this.props.data.allFile.nodes.reduce((acc, node) => {
      const doc = node.childrenDocumentationJs.map(def => {
        def.codeLocation.file = node.relativePath
        return def
      })
      return acc.concat(doc)
    }, [])

    const funcs = sortBy(docs, func => func.name).filter(
      func => func.name !== `deleteNodes`
    )

    return (
      <Layout location={this.props.location} itemList={itemListDocs}>
        <Container>
          <Helmet>
            <title>Actions</title>
            <meta
              name="description"
              content="Documentation on actions and how they help you manipulate state within Gatsby"
            />
          </Helmet>
          <h1 sx={{ mt: 0 }}>Actions</h1>
          <p>
            Gatsby uses
            {` `}
            <a href="http://redux.js.org">Redux</a>
            {` `}
            internally to manage state. When you implement a Gatsby API, you are
            passed a collection of actions (equivalent to boundActionCreators in
            redux) which you can use to manipulate state on your site.
          </p>
          <p>
            The object
            {` `}
            <code>actions</code>
            {` `}
            contains the functions and these can be individually extracted by
            using ES6 object destructuring.
          </p>
          <div className="gatsby-highlight">
            <pre
              className="language-javascript"
              dangerouslySetInnerHTML={{
                __html: `<code class="language-javascript"><span class="token comment">// For function createNodeField</span>
exports<span class="token punctuation">.</span><span class="token function-variable function">onCreateNode</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> node<span class="token punctuation">,</span> getNode<span class="token punctuation">,</span> actions <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span> createNodeField <span class="token punctuation">}</span> <span class="token operator">=</span> actions
<span class="token punctuation">}</span></code>`,
              }}
            />
          </div>
          <h2 sx={{ mb: 3 }}>Functions</h2>
          <ul>
            {funcs.map(node => (
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

export default ActionCreatorsDocs

export const pageQuery = graphql`
  query {
    allFile(
      filter: {
        relativePath: {
          in: [
            "gatsby/src/redux/actions/public.js"
            "gatsby/src/redux/actions/restricted.js"
          ]
        }
      }
    ) {
      nodes {
        relativePath
        childrenDocumentationJs {
          availableIn
          codeLocation {
            start {
              line
            }
            end {
              line
            }
          }
          ...DocumentationFragment
        }
      }
    }
  }
`
