import React from "react"
import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

const SectionTitle = ({ children, isActive }) => (
  <div
    css={{
      color: colors.lilac,
      fontFamily: options.headerFontFamily.join(`,`),
      fontSize: scale(-2 / 5).fontSize,
      fontWeight: `normal`,
      letterSpacing: `.15em`,
      lineHeight: 3,
      textTransform: `uppercase`,
      [presets.Tablet]: {
        color: isActive ? colors.gatsby : false,
        ":hover": {
          color: colors.gatsby,
        },
      },
    }}
  >
    {children}
  </div>
)

export default SectionTitle
