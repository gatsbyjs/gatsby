import * as React from "react"
import { StaticQuery, graphql } from "gatsby"

function Variable(props) {
  return (
    <StaticQuery
      query={reactHelmetPluginQuery}
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

const reactHelmetPluginQuery = graphql`
  query ReactHelmetPluginQuery {
    sitePlugin(name: { eq: "gatsby-plugin-react-helmet" }) {
      name
      version
    }
  }
`

export default Variable
