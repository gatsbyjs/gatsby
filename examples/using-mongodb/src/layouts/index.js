import React from "react"
import Link from "gatsby-link"

class DefaultLayout extends React.Component {
  render() {
    return (
      <div>
        <Link style={{ textDecoration: `none` }} to="/">
          <h3 style={{ color: `tomato` }}>
            Example of using mongoDB as a data source for a Gatsby site
          </h3>
        </Link>
        {this.props.children()}
        <hr />
        <p>
          The src for this website is at
          {` `}
          <a href="https://github.com/gatsbyjs/gatsby/tree/1.0/examples/using-mongodb">
            https://github.com/gatsbyjs/gatsby/tree/1.0/examples/using-mongodb
          </a>
        </p>
      </div>
    )
  }
}

export default DefaultLayout
