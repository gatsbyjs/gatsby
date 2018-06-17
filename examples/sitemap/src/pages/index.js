import React from "react"

const IndexRoute = () => (
  <div>
    <p>
      Welcome to the GatsbyJS Sitemap Demo. Visit{` `}
      <a href="/sitemap.xml">to see the generated sitemap.</a>
    </p>
    <p>
      Note: gatsby-plugin-sitemap uses <code>siteMetadata.siteUrl</code>
      {` `}
      defined in gatsby-config.js to construct absolute URLs!
    </p>
  </div>
)

export default IndexRoute
