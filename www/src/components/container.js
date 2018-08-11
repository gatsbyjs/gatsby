import React from "react"
import presets from "../utils/presets"

import { rhythm, options } from "../utils/typography"

const Container = ({ children, className, hasSideBar = true, containerCss = {} }) => (
  <div
    css={{
      maxWidth: hasSideBar
        ? rhythm(presets.maxWidthWithSidebar)
        : rhythm(presets.maxWidth),
      margin: `0 auto`,
      padding: `${rhythm(1.5)} ${rhythm(options.blockMarginBottom)}`,
      paddingBottom: rhythm(3.5),
      position: `relative`,
      [presets.Tablet]: {
        paddingBottom: rhythm(1.5),
      },
      ...containerCss,
    }}
    className={className}
  >
    {children}
  </div>
)

export default Container