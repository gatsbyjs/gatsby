import React from "react"
import Link from "gatsby-link"

import { rhythm } from "../utils/typography"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          margin: `0 auto`,
          marginTop: rhythm(1.5),
          maxWidth: 650,
          paddingLeft: rhythm(3 / 4),
          paddingRight: rhythm(3 / 4),
        }}
      >
        <Link style={{ textDecoration: "none" }} to="/">
          <h3 style={{ color: "tomato", marginBottom: rhythm(1.5) }}>
            Example of using Drupal as a data source for a Gatsby site
          </h3>
        </Link>
        {this.props.children}
        <hr />
        <h3 style={{ marginTop: rhythm(2) }}>
          The Drupal site that the data is sourced from can be found at
          {" "}
          <a href="https://dev-gatsbyjs-d8.pantheonsite.io/">
            https://dev-gatsbyjs-d8.pantheonsite.io/
          </a>
        </h3>
      </div>
    )
  }
}

export default DefaultLayout
