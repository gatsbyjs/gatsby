import { default as breakpoints } from "./breakpoints"
import { default as colors } from "./colors"
import { default as fonts } from "./fonts"
import { default as fontSizes } from "./font-sizes"
import { default as fontWeights } from "./font-weights"
import { default as letterSpacings } from "./letter-spacings"
import { default as lineHeights } from "./line-heights"
import { default as mediaQueries } from "./media-queries"
import { default as space } from "./space"
import { default as radii } from "./radii"
import { default as transition } from "./transition"
import { default as shadows } from "./shadows"
import { default as zIndices } from "./z-indices"

// gatsby-theme-ui-theme-default
// provides a theme-ui theme using gatsby-design-tokens

const pxToRem = (value, fontSizeInPX = 16) => value / fontSizeInPX + `rem`

// breakpoints
// theme-ui requires an array
let bp = []
for (const b in breakpoints) {
  bp.push(breakpoints[b])
}

// colors
// extend colors with theme-ui required keys
// https://theme-ui.com/theme-spec#color
const c = {
  ...colors,
  // Body foreground color
  // overwrite what's currently in _colors_ from _gatsby-design-tokens_
  // also see _heading_ key below
  text: colors.grey[80], // colors.text.primary
  // Body background color
  background: colors.white,
  // Primary brand color for links, buttons, etc.
  primary: colors.gatsby,
  // A secondary brand color for alternative styling
  secondary: colors.purple[40],
  // A contrast color for emphasizing UI
  accent: colors.orange[60],
  // A faint color for backgrounds, borders, and accents that do not require high contrast with the background color
  muted: colors.grey[5],
  // end Theme-UI required keys
  // gatsby-design-tokens has the following in colors.text,
  // which conflicts with theme-ui's default color _text_
  // making text.header and text.secondary available as
  // _heading_ and _textMuted_ resolves that
  heading: colors.text.header, // text.header
  textMuted: colors.text.secondary, // text.secondary
}

// fonts
// theme-ui requires a CSS string
let f = {}
for (const fontFamily in fonts) {
  f[fontFamily] = fonts[fontFamily].join(`, `)
}

// we are targeting web, and choose to deliver thos as _rem_, not px
// fontSizes
// space

export default {
  breakpoints: bp,
  colors: c,
  fonts: f,
  fontSizes: fontSizes.map(token => pxToRem(token)),
  space: space.map(token => pxToRem(token)),
  fontWeights: fontWeights,
  letterSpacings: letterSpacings,
  lineHeights: lineHeights,
  mediaQueries: mediaQueries,
  radii: radii,
  shadows: shadows,
  transition: transition,
  zIndices: zIndices,
}

// // individual exports
// // breakpoints as array of pixel values (as opposed to object)
// export { bp as breakpoints }
// // colors extended with theme-ui required values
// export { c as colors }
// // fonts as CSS string (as opposed to array of font names)
// export { f as fonts }
// // fontSizes as `rem` (as opposed to pixels)
// export { fs as fontSizes }
// // space as `rem` (as opposed to pixels)
// export { s as space }
