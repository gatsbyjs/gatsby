import React from "react"
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
  return <p {...props}>{data.sitePage.pluginCreator.name}</p>
}

export default InlineQuery
