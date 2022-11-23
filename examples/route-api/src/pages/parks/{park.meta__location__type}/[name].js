import * as React from "react"
import { Link } from "gatsby"

function NonExistingPark({ params, pageContext }) {
  return (
    <div className="wrapper">
      <header>
        <Link to="/">Go back to "Home"</Link>
      </header>
      <main>
        <h1>Couldn't find the {pageContext.meta__location__type}</h1>
        <p>We couldn't locate "{params.name}"</p>
      </main>
    </div>
  )
}

export default NonExistingPark
