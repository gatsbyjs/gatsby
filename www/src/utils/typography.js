import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import { colors, lineHeights } from "../gatsby-plugin-theme-ui"
// typography.js expects an array,
// so grab font stacks directly from tokens
import { fonts } from "gatsby-design-tokens"

const _options = {
  bodyFontFamily: fonts.system,
  headerFontFamily: fonts.header,
  baseLineHeight: lineHeights.body,
  headerLineHeight: lineHeights.heading,
  headerColor: colors.text.header,
  bodyColor: colors.text.primary,
  plugins: [new CodePlugin()],
}

const typography = new Typography(_options)

export const { scale, rhythm, options } = typography
export default typography
