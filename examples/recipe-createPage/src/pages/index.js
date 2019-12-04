import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <main>
    createPage Recipe (see pages at <Link to="Fido">Fido</Link> and{` `}
    <Link to="Sparky">Sparky</Link>)
  </main>
)

export default IndexPage
