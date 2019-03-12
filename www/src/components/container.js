import React from "react"

import presets, { space } from "../utils/presets"
import { rhythm } from "../utils/typography"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    css={{
      maxWidth: hasSideBar ? rhythm(28) : rhythm(36),
      margin: `0 auto`,
      padding: rhythm(space[6]),
      position: `relative`,
      [presets.Lg]: {
        paddingTop: rhythm(space[9]),
        paddingBottom: rhythm(space[9]),
      },
      ...overrideCSS,
    }}
  >
    {children}
  </div>
)

export default Container
