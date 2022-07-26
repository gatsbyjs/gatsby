import React from "react"
import { Link } from "gatsby"

const IndexPage = () => (
  <>
    <h1>MDX Example</h1>
    <p>Overview of MDX pages:</p>
    <ul>
      <li>
        <Link to="/chart-info/">Page created from src/pages folder</Link>
      </li>
    </ul>
  </>
)

export default IndexPage
