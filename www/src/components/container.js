import React from "react"
import presets from "../utils/presets"

import { rhythm, scale } from "../utils/typography"

export default ({ children, className, hasSideBar = true }) =>
  <div
    css={{
      maxWidth: hasSideBar
        ? rhythm(presets.maxWidthWithSidebar)
        : rhythm(presets.maxWidth),
      margin: `0 auto`,
      padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      paddingBottom: rhythm(3.5),
      position: `relative`,
      [presets.Tablet]: {
        paddingBottom: rhythm(1.5),
      },
    }}
    className={className}
  >
    {children}
  </div>
