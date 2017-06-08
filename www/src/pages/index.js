import React from "react"
import Link from "gatsby-link"

const IndexRoute = React.createClass({
  render() {
    return (
      <div>
        <h1>Gatsby website 0.0.0.3</h1>
        <Link to="/docs/">
          Docs
        </Link>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = graphql`
query Index {
  site {
    siteMetadata {
      title
    }
  }
}
`
