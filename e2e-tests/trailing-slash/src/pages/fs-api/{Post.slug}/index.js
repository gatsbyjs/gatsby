import * as React from "react"
import { Link } from "gatsby"

const FSApiPage = ({ pageContext }) => {
  return (
    <main>
      <h1>{pageContext.slug}</h1>
      <Link to="/" data-testid="go-back">
        Go Back
      </Link>
      <pre>
        <code>{JSON.stringify(pageContext, null, 2)}</code>
      </pre>
    </main>
  )
}

export default FSApiPage
