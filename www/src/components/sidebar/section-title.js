import React from "react"
import presets, { colors } from "../../utils/presets"
import { scale, options, rhythm } from "../../utils/typography"

const SectionTitle = ({ children, isActive }) => (
  <h3
    css={{
      alignItems: `center`,
      color: colors.lilac,
      display: `flex`,
      fontFamily: options.headerFontFamily.join(`,`),
      fontSize: scale(-2 / 5).fontSize,
      fontWeight: `normal`,
      letterSpacing: `.1em`,
      margin: 0,
      textTransform: `uppercase`,
      paddingTop: rhythm(options.blockMarginBottom),
      paddingBottom: rhythm(options.blockMarginBottom),
      [presets.Tablet]: {
        color: isActive ? colors.gatsby : false,
        ":hover": {
          color: colors.gatsby,
        },
      },
    }}
  >
    {children}
  </h3>
)

export default SectionTitle
