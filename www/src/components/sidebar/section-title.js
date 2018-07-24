import React from "react"
import presets, { colors } from "../../utils/presets"
import { scale, options } from "../../utils/typography"

const SectionTitle = ({ children, isActive, disabled, level }) => (
  <h3
    css={{
      alignItems: `center`,
      display: `flex`,
      fontFamily: options.systemFontFamily.join(`,`),
      fontSize: scale(-2 / 6).fontSize,
      fontWeight: isActive ? `bold` : `normal`,
      margin: 0,
      ...(level === 0 && {
        color: colors.lilac,
        fontFamily: options.headerFontFamily.join(`,`),
        letterSpacing: `.075em`,
        textTransform: `uppercase`,
      }),

      [presets.Tablet]: {
        color: isActive ? colors.gatsby : false,
        // fontWeight: isActive ? `bold` : false,
        "&:hover": {
          color: disabled ? false : colors.gatsby,
        },
      },
    }}
  >
    {children}
  </h3>
)

export default SectionTitle
