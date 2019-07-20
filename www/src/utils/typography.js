import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import { colors, lineHeights } from "./presets"
// typography.js expects an array,
// so grab font stacks directly from tokens
import { fonts } from "gatsby-design-tokens"

const _options = {
  bodyFontFamily: fonts.system,
  headerFontFamily: fonts.header,
  baseLineHeight: lineHeights.default,
  headerLineHeight: lineHeights.dense,
  headerColor: colors.text.header,
  bodyColor: colors.text.primary,
  plugins: [new CodePlugin()],
}

const typography = new Typography(_options)

export const { scale, rhythm, options } = typography
export default typography
