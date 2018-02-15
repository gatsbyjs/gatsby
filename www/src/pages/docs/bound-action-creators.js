import React from "react"
import Helmet from "react-helmet"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class ActionCreatorsDocs extends React.Component {
  render() {
    return (
      <Container>
        <Helmet>
          <title>Bound Action Creators</title>
        </Helmet>
        <h1 id="bound-action-creators" css={{ marginTop: 0 }}>
          Bound Action Creators
        </h1>
        <p>
          Gatsby uses
          {` `}
          <a href="http://redux.js.org">Redux</a>
          {` `}
          internally to manage state. When you implement a Gatsby API, you're
          passed a collection of "Bound Action Creators" (functions which create
          and dispatch Redux actions when called) which you can use to
          manipulate state on your site.
        </p>
        <p>
          The object
          {` `}
          <code>boundActionCreators</code>
          {` `}
          contains the functions and these can be individually extracted by
          using ES6 object destructuring.
        </p>
        <pre
          dangerouslySetInnerHTML={{
            __html: `
<code class=" language-javascript"><span class="token comment">// For function createNodeField</span>
exports<span class="token punctuation">.</span><span class="token function-variable function">onCreateNode</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token punctuation">{</span> node<span class="token punctuation">,</span> getNode<span class="token punctuation">,</span> boundActionCreators <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
  <span class="token keyword">const</span> <span class="token punctuation">{</span> createNodeField <span class="token punctuation">}</span> <span class="token operator">=</span> boundActionCreators
<span class="token punctuation">}</span></code>
  `,
          }}
        />
        <h2 css={{ marginBottom: rhythm(1 / 2) }}>Functions</h2>
        <ul css={{ ...scale(-1 / 5) }}>
          {this.props.data.allDocumentationJs.edges.map(({ node }, i) => (
            <li key={`function list ${node.name}`}>
              <a href={`#${node.name}`}>{node.name}</a>
            </li>
          ))}
        </ul>
        <hr />
        <h2>Reference</h2>
        <Functions functions={this.props.data.allDocumentationJs.edges} />
      </Container>
    )
  }
}

export default ActionCreatorsDocs

export const pageQuery = graphql`
  query ActionCreatorDocsQuery {
    allDocumentationJs(
      filter: { id: { regex: "/src.*actions.js/" } }
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
