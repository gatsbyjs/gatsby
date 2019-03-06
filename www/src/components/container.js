import React from "react"
import presets from "../utils/presets"

import { rhythm, options } from "../utils/typography"

const Container = ({ children, className = ``, hasSideBar = true }) => (
  <div
    css={{
      maxWidth: hasSideBar
        ? rhythm(presets.maxWidthWithSidebar)
        : rhythm(presets.maxWidth),
      margin: `0 auto`,
      padding: `${rhythm(options.blockMarginBottom * 2)} ${rhythm(
        options.blockMarginBottom
      )}`,
      position: `relative`,
      [presets.Md]: {
        // Regular padding without mobile navigation
        paddingBottom: rhythm(options.blockMarginBottom * 2),
      },
    }}
    className={className}
  >
    {children}
  </div>
)

export default Container
