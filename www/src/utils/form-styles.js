import presets, { colors } from "../utils/presets"
import { rhythm, options } from "../utils/typography"

export const formInput = {
  backgroundColor: `#fff`,
  border: `1px solid ${colors.ui.bright}`,
  borderRadius: presets.radius,
  color: colors.brand,
  fontFamily: options.headerFontFamily.join(`,`),
  padding: rhythm(1 / 2),
  verticalAlign: `middle`,
  transition: `all ${presets.animation.speedDefault} ${
    presets.animation.curveDefault
  }`,
  "::placeholder": {
    color: colors.lilac,
    opacity: 1,
  },
}
