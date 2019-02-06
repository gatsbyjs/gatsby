import React from "react"
import { useStaticQuery, graphql } from "gatsby"

function VariableQuery(props) {
  const data = useStaticQuery(variableQuery)
  return <p {...props}>{data.sitePage.pluginCreator.version}</p>
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
