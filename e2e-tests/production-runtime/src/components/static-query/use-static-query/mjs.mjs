import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

function QueryInMJSFile(props) {
  const data = useStaticQuery(graphql`
    query {
      sitePage(path: { eq: "/static-query/" }) {
        pluginCreator {
          mjs: name
        }
      }
    }
  `)

  if (data) {
    return <p {...props}>{data.sitePage.pluginCreator.mjs}</p>
  }

  return `Error`
}

export default QueryInMJSFile
