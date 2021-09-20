import React from "react"
import { Link, graphql } from "gatsby"

export default function QODHeavyQuery({ data }) {
  return (
    <>
      <Link to="../no-query/" data-testid="no-query-page-link">
        Page with no query
      </Link>
      <p>Hello on a page with possibly heavy query</p>
      <p>
        Data:{" "}
        <code data-testid="query-data">
          {data.queryOnDemandMock.doSomeWaiting}
        </code>
      </p>
    </>
  )
}

export const query = graphql`
  {
    queryOnDemandMock {
      doSomeWaiting
    }
  }
`
