import React from "react"
import { graphql } from "gatsby"

function QueryValidationError() {
  return <p data-testid="hot">Working</p>
}

export default QueryValidationError

export const query = graphql`
  {
    site {
      siteMetadata {
        title
        # query-validation-error
      }
    }
  }
`
