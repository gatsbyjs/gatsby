import React from "react"
import Helmet from "react-helmet"
import sortBy from "lodash/sortBy"

import Functions from "../../components/function-list"
import { rhythm, scale } from "../../utils/typography"
import Container from "../../components/container"

class ActionCreatorsDocs extends React.Component {
  render() {
    const funcs = sortBy(
      this.props.data.file.childrenDocumentationJs,
      func => func.name
    )
    return (
      <Container>
        <Helmet>
          <title>Actions</title>
        </Helmet>
        <h1 css={{ marginTop: 0 }}>Actions</h1>
        <p>
          Gatsby uses
          {` `}
          <a href="http://redux.js.org">Redux</a>
          {` `}
          internally to manage state. When you implement a Gatsby API, you're
          passed a collection of actions (equivalent to boundActionCreators in
          redux) which you can use to manipulate state on your site.
        </p>
        <h2 css={{ marginBottom: rhythm(1 / 2) }}>Functions</h2>
        <ul css={{ ...scale(-1 / 5) }}>
          {funcs.map((node, i) => (
            <li key={`function list ${node.name}`}>
              <a href={`#${node.name}`}>{node.name}</a>
            </li>
          ))}
        </ul>
        <hr />
        <h2>Reference</h2>
        <Functions functions={funcs} />
      </Container>
    )
  }
}

export default ActionCreatorsDocs

export const pageQuery = graphql`
  query ActionCreatorDocsQuery {
    file(relativePath: { eq: "gatsby/src/redux/actions.js" }) {
      childrenDocumentationJs {
        name
        ...FunctionList
      }
    }
  }
`
