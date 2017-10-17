import React from "react"
import Link from "gatsby-link"
import * as PropTypes from "prop-types"

import { rhythm } from "../utils/typography"

const propTypes = {
  children: PropTypes.func.isRequired,
}

class DefaultLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: `0 auto`,
          marginTop: rhythm(1.5),
          marginBottom: rhythm(1.5),
          maxWidth: 650,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
        }}
      >
        <Link style={{ textDecoration: `none` }} to="/">
          <h3 style={{ color: `tomato`, marginBottom: rhythm(1.5) }}>
            Example of using Contentful as a data source for a Gatsby site
          </h3>
        </Link>
        {this.props.children()}
        <hr style={{ marginTop: rhythm(3) }} />
        <p>
          The src for this website is at
          {` `}
          <a href="https://github.com/gatsbyjs/gatsby/tree/master/examples/using-contentful">
            https://github.com/gatsbyjs/gatsby/tree/master/examples/using-contentful
          </a>
        </p>
        <p>
          The Contentful site that is providing the data for this site is at
          {` `}
          <a href="https://discovery.contentful.com/entries/by-content-type/2PqfXUJwE8qSYKuM0U6w8M?delivery_access_token=e481b0f7c5572374474b29f81a91e8ac487bb27d70a6f14dd12142837d8e980a&space_id=ubriaw6jfhm1">
            https://discovery.contentful.com/entries/by-content-type/2PqfXUJwE8qSYKuM0U6w8M?delivery_access_token=e481b0f7c5572374474b29f81a91e8ac487bb27d70a6f14dd12142837d8e980a&space_id=ubriaw6jfhm1
          </a>
        </p>
      </div>
    )
  }
}

DefaultLayout.propTypes = propTypes

export default DefaultLayout
