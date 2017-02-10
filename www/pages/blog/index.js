import React from "react"
import Link from "react-router/lib/Link"

import { rhythm } from "utils/typography"

const IndexRoute = React.createClass({
  render () {
    return (
      <div>
        <h1>Blog</h1>
        <p>Coming soon</p>
      </div>
    )
  },
})

export default IndexRoute

export const pageQuery = `
{
  site {
    siteMetadata {
      title
    }
  }
}
`

