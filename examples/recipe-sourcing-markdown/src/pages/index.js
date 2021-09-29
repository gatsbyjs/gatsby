import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <main>
    Sourcing markdown recipe (see page at{` `}
    <Link to="my-first-post">/my-first-post</Link>)
  </main>
)

export default IndexPage
