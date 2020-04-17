import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

function InlineQuery(props) {
  const data = useStaticQuery(graphql`
    query {
      sitePage(path: { eq: "/static-query/" }) {
        pluginCreator {
          name
        }
      }
    }
  `)

  if (data) {
    return <p {...props}>{data.sitePage.pluginCreator.name}</p>
  }

  return `Error`
}

export default InlineQuery
