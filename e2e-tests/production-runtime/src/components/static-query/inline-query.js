import * as React from "react"
import { StaticQuery, graphql } from "gatsby"

function InlineQuery(props) {
  return (
    <StaticQuery
      query={graphql`
        query {
          sitePage(path: { eq: "/static-query/" }) {
            internalComponentName
          }
        }
      `}
      render={data => <p {...props}>{data.sitePage.internalComponentName}</p>}
    />
  )
}

export default InlineQuery
