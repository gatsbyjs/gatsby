import React from "react"
import Link from "gatsby-link"

import { rhythm } from "../utils/typography"

const MainLayout = ({ children, location }) => (
  <div
    css={{
      maxWidth: 600,
      margin: `0 auto`,
      padding: `${rhythm(1)} ${rhythm(3 / 4)}`,
    }}
  >
    {location.pathname !== `/` && (
      <h4 css={{ margin: 0 }}>
        <Link to={`/`}>Home</Link>
      </h4>
    )}
    {children()}
  </div>
)

export default MainLayout
