import React from "react"

import { colors } from "../utils/presets"
import { rhythm, scale, options } from "../utils/typography"

const Banner = ({ children, background }) => (
  <div
    className="banner"
    css={{
      backgroundColor: background ? background : colors.gatsby,
      color: colors.ui.bright,
      fontFamily: options.headerFontFamily.join(`,`),
      fontSize: scale(-1 / 5).fontSize,
      padding: rhythm(1 / 2),
      position: `fixed`,
      WebkitFontSmoothing: `antialiased`,
      width: `100%`,
      zIndex: `3`,
    }}
  >
    {children}
  </div>
)

export default Banner
