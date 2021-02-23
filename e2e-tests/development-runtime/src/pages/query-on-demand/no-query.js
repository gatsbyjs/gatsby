import React from "react"
import { Link } from "gatsby"

export default function QODNoQuery() {
  return (
    <>
      <Link to="../possibly-heavy-query/" data-testid="heavy-query-page-link">
        Page with heavy query
      </Link>
      <p>Hello on a page without a query</p>
    </>
  )
}
