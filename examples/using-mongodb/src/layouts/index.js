import React from "react"
import Link from "gatsby-link"
import Helmet from "react-helmet"

class DefaultLayout extends React.Component {
  render() {
    let siteMetadata = { title: `mongoDB within Gatsby.JS` }

    return (
      <div className="websites">
        <Helmet defaultTitle={siteMetadata.title}>
          <meta
            name="description"
            content="An example site to show how to use mongoDB with Gatsby.JS"
          />
          <meta name="keywords" content="websites listings" />
        </Helmet>
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
          <a href="https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mongodb">
            https://github.com/gatsbyjs/gatsby/tree/master/examples/using-mongodb
          </a>
        </p>
      </div>
    )
  }
}

export default DefaultLayout
