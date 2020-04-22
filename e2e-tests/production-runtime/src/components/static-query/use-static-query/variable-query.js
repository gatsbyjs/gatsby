import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

function VariableQuery(props) {
  const data = useStaticQuery(variableQuery)

  if (data) {
    return <p {...props}>{data.sitePage.pluginCreator.version}</p>
  }

  return `Error`
}

const variableQuery = graphql`
  query {
    sitePage(path: { eq: "/static-query/" }) {
      pluginCreator {
        version
      }
    }
  }
`

export default VariableQuery
