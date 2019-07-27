/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import { mediaQueries } from "../gatsby-plugin-theme-ui"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    sx={{
      maxWidth: hasSideBar
        ? `mainContentWidth.withSidebar`
        : `mainContentWidth.default`,
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
