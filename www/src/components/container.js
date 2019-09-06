import React from "react"

import { space, sizes, mediaQueries } from "../utils/presets"

const Container = ({ children, withSidebar = true, overrideCSS }) => (
  <div
    css={{
      maxWidth: withSidebar
        ? sizes.mainContentWidth.withSidebar
        : sizes.mainContentWidth.default,
      margin: `0 auto`,
      padding: space[6],
      position: `relative`,
      [mediaQueries.lg]: {
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
