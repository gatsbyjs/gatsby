import React from "react"
import { StaticQuery, graphql } from "gatsby"

function Variable(props) {
  return (
    <StaticQuery
      query={pluginQuery}
      render={data => (
        <div>
          <p {...props}>
            {data.sitePlugin.name}: {data.sitePlugin.version}
          </p>
        </div>
      )}
    />
  )
}

const pluginQuery = graphql`
  query PluginQuery {
    sitePlugin(name: { eq: "gatsby-source-fake-data" }) {
      name
      version
    }
  }
`

export default Variable
