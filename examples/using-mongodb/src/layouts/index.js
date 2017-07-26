import React from "react"
import Link from "gatsby-link"
import Helmet from "react-helmet"

class DefaultLayout extends React.Component {
  render() {
    let siteMetadata = {title: 'mongoDB within Gatsby.JS'}

    return (
      <div class="websites">
        <Helmet
          defaultTitle={siteMetadata.title}
          meta={[
            { name: `description`, content: `An example site to show how to use mongoDB with Gatsby.JS` },
            { name: `keywords`, content: `websites listings` },
          ]}
        />
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