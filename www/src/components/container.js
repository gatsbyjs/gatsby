import React from "react"

import { rhythm, options } from "../utils/typography"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    css={{
      maxWidth: hasSideBar ? rhythm(26) : rhythm(36),
      margin: `0 auto`,
      padding: `${rhythm(options.blockMarginBottom * 2)} ${rhythm(
        options.blockMarginBottom
      )}`,
      position: `relative`,
      ...overrideCSS,
    }}
  >
    {children}
  </div>
)

export default Container
