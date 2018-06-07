import React from "react"
import Layout from "../components/layout"

const IndexRoute = () => (
  <Layout>
    <div>
      <p>
        Welcome to the GatsbyJS Sitemap Demo. Visit{` `}
        <a href="/sitemap.xml">
          to see the generated sitemap.
        </a>
      </p>
      <p>
        Note: gatsby-plugin-sitemap uses <code>siteMetadata.siteUrl</code>{` `}
        defined in gatsby-config.js to construct absolute URLs!
      </p>
    </div>
  </Layout>
)

export default IndexRoute
