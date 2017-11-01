import React from "react"

import { rhythm, scale } from "../utils/typography"

export default ({
  children,
  className,
  paddingTop = rhythm(2),
  paddingBottom = rhythm(2),
}) => (
  <div
    className={className}
    css={{
      overflow: `hidden`,
      margin: `0 auto`,
      maxWidth: 1024,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
      paddingTop,
      paddingBottom,
    }}
  >
    {children}
  </div>
)
