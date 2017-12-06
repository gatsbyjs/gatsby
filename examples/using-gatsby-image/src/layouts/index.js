import React from "react"
import Navigation from "../components/navigation"

import { rhythm, scale, options } from "../utils/typography"

import "typeface-pt-sans"
import "typeface-oswald"

const MainLayout = ({ children, location }) => (
  <div
    css={{
      maxWidth: 640,
      margin: `0 auto`,
      padding: `${rhythm(1)} ${rhythm(3 / 4)}`,
    }}
  >
    {location.pathname !== `/` && <Navigation />}
    {children()}
  </div>
)

export default MainLayout
