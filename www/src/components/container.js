/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import { mediaQueries } from "../utils/presets"
import { rhythm } from "../utils/typography"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    sx={{
      maxWidth: hasSideBar ? rhythm(28) : rhythm(36),
      mx: `auto`,
      p: 6,
      position: `relative`,
      [mediaQueries.lg]: {
        py: 9,
      },
      ...overrideCSS,
    }}
  >
    {children}
  </div>
)

export default Container
