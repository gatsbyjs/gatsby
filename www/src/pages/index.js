import React from "react"
import Link from "react-router/lib/Link"

import { rhythm } from "../utils/typography"

const IndexRoute = React.createClass({
  render() {
    return (
      <div>
        <h1>Gatsby website 0.0.0.2</h1>
        <Link to="/docs/">
          Docs
        </Link>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = graphql`
query Index{
  site {
    siteMetadata {
      title
    }
  }
}
`
