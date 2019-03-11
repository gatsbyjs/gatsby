import React from "react"

import presets from "../utils/presets"
import { rhythm, options } from "../utils/typography"

const Container = ({ children, hasSideBar = true, overrideCSS }) => (
  <div
    css={{
      maxWidth: hasSideBar ? rhythm(28) : rhythm(36),
      margin: `0 auto`,
      padding: `${rhythm(options.blockMarginBottom)} ${rhythm(
        options.blockMarginBottom
      )}`,
      position: `relative`,
      [presets.Lg]: {
        paddingTop: rhythm(options.blockMarginBottom * 2),
        paddingBottom: rhythm(options.blockMarginBottom * 2),
      },
      ...overrideCSS,
    }}
  >
    {children}
  </div>
)

export default Container
