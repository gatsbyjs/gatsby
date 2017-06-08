import React from "react"
import Link from "gatsby-link"

class Dev404Page extends React.Component {
  render() {
    const pathname = this.props.location.pathname
    let newFilePath
    if (pathname === `/`) {
      newFilePath = `src/pages/index.js`
    } else if (pathname.slice(-1) === `/`) {
      newFilePath = `src/pages${pathname.slice(0, -1)}.js`
    } else {
      newFilePath = `src/pages${pathname}.js`
    }
    return (
      <div>
        <h1>Gatsby.js development 404 page</h1>
        <p>There's not a page yet at <code>{pathname}</code></p>
        <p>
          Create a React.js component in your site directory at
          {` `}
          <code>{newFilePath}</code>
          {` `}
          and this page will automatically refresh to show the new page
          component
          you created.
        </p>
        {this.props.data.allSitePage &&
          this.props.data.allSitePage.totalCount > 1 &&
          <div>
            <p>
              If you were trying to reach another page, perhaps you can find it
              below.
            </p>
            <h2>Pages ({this.props.data.allSitePage.totalCount})</h2>
            <ul>
              {this.props.data.allSitePage.edges.map(({ node }) =>
                <li><Link to={node.path}>{node.path}</Link></li>
              )}
            </ul>
          </div>}
      </div>
    )
  }
}

export default Dev404Page

export const pageQuery = graphql`
query Dev404Page {
  allSitePage(path: { ne: "/dev-404-page/"}) {
    totalCount
    edges {
      node {
        path
      }
    }
  }
}
`
