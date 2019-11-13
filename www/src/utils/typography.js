import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import { colors, lineHeights, fonts } from "../gatsby-plugin-theme-ui"

const _options = {
  // typography.js expects an array, theme-ui a CSS prop value
  bodyFontFamily: fonts.system.split(`, `),
  headerFontFamily: fonts.header.split(`, `),
  baseLineHeight: lineHeights.body,
  headerLineHeight: lineHeights.heading,
  headerColor: colors.heading,
  bodyColor: colors.text,
  plugins: [new CodePlugin()],
}

const typography = new Typography(_options)

export const { scale, rhythm, options } = typography
export default typography
