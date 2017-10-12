import React from "react"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class ActionCreatorsDocs extends React.Component {
  render() {
    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Bound Action Creators</h1>
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
