import React from "react"

import { space, breakpoints } from "../utils/presets"
import { rhythm } from "../utils/typography"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    css={{
      maxWidth: hasSideBar ? rhythm(28) : rhythm(36),
      margin: `0 auto`,
      padding: space[6],
      position: `relative`,
      [breakpoints.lg]: {
        paddingTop: space[9],
        paddingBottom: space[9],
      },
      ...overrideCSS,
    }}
  >
    {children}
  </div>
)

export default Container
