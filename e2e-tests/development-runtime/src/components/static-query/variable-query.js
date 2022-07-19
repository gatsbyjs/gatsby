import React from "react"
import { StaticQuery, graphql } from "gatsby"

function Variable(props) {
  return (
    <StaticQuery
      query={fakeDataPluginQuery}
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

const fakeDataPluginQuery = graphql`
  query FakeDataPluginQuery {
    sitePlugin(name: { eq: "gatsby-source-fake-data" }) {
      name
      version
    }
  }
`

export default Variable
