import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"

function ExportedVariableQuery(props) {
  const data = useStaticQuery(exportedVariableQuery)

  if (data) {
    return <p {...props}>{data.sitePage.path}</p>
  }

  return `Error`
}

export const exportedVariableQuery = graphql`
  query {
    sitePage(path: { eq: "/static-query/" }) {
      path
    }
  }
`

export default ExportedVariableQuery
