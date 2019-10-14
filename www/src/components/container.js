/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "../gatsby-plugin-theme-ui"

const Container = ({ children, withSidebar = true, overrideCSS }) => (
  <div
    sx={{
      maxWidth: withSidebar
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
