import React from "react"
import { graphql } from "gatsby"

function PageQueryRuntimeError({ data }) {
  console.log(data.errorRecoveryJson)
  if (data.errorRecoveryJson.hasError) {
    throw new Error(`Page query results caused runtime error`)
  }
  return (
    <>
      <p data-testid="hot">Working</p>
      <pre data-testid="results">{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export default PageQueryRuntimeError

export const query = graphql`
  {
    errorRecoveryJson(selector: { eq: "page-query" }) {
      hasError
    }
  }
`
