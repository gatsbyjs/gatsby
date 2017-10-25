import React from "react"
import Navigation from "../components/navigation"

import { rhythm, scale, options } from "../utils/typography"

const MainLayout = ({ children, location }) => (
  <div
    css={{
      maxWidth: 640,
      margin: `0 auto`,
      padding: `${rhythm(1)} ${rhythm(3 / 4)}`,
    }}
  >
    {location.pathname !== `/` && (
      <div css={{ "& h1": { opacity: 0.5 } }}>
        <Navigation />
      </div>
    )}
    {children()}
  </div>
)

export default MainLayout
