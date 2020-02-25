/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
