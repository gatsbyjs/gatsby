import React from "react"
import { graphql, useStaticQuery } from "gatsby"

function StaticQueryRuntimeError() {
  const data = useStaticQuery(graphql`
    {
      errorRecoveryJson(selector: { eq: "static-query" }) {
        hasError
      }
    }
  `)
  console.log(data.errorRecoveryJson)
  if (data.errorRecoveryJson.hasError) {
    throw new Error(`Static query results caused runtime error`)
  }
  return (
    <>
      <p data-testid="hot">Working</p>
      <pre data-testid="results">{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default StaticQueryRuntimeError
