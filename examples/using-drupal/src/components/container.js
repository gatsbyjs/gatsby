import React from "react"

import { rhythm, scale } from "../utils/typography"

export default ({ children, className }) => (
  <div
    className={className}
    css={{
      overflow: `hidden`,
      margin: `0 auto`,
      marginTop: rhythm(1.5),
      marginBottom: rhythm(1.5),
      maxWidth: 960,
      paddingLeft: rhythm(3 / 4),
      paddingRight: rhythm(3 / 4),
    }}
  >
    {children}
  </div>
)
