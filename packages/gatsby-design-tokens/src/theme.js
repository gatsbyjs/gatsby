import { default as breakpointsTokens } from "./breakpoints"
import { default as colorsTokens } from "./colors"
import { default as fontsTokens } from "./fonts"
import { default as fontSizesTokens } from "./font-sizes"
import { default as fontWeightsTokens } from "./font-weights"
import { default as letterSpacingsTokens } from "./letter-spacings"
import { default as lineHeightsTokens } from "./line-heights"
import { default as mediaQueriesTokens } from "./media-queries"
import { default as spaceTokens } from "./space"
import { default as radiiTokens } from "./radii"
import { default as transitionTokens } from "./transition"
import { default as shadowsTokens } from "./shadows"
import { default as zIndicesTokens } from "./z-indices"

// gatsby-theme-ui-theme-default
// provides a theme-ui theme using gatsby-design-tokens

const pxToRem = (value, fontSizeInPX = 16) => value / fontSizeInPX + `rem`

// let's tweak some values then, shall we?

// breakpoints
// theme-ui requires an array
let bp = []
for (const b in breakpointsTokens) {
  bp.push(breakpointsTokens[b])
}

// colors
// extend colors with theme-ui required keys
// https://theme-ui.com/theme-spec#color
const c = {
  ...colorsTokens,
  // Body foreground color
  // overwrite what's currently in _colors_ from _gatsby-design-tokens_
  // also see _heading_ key below
  text: colorsTokens.grey[80], // colors.text.primary
  // Body background color
  background: colorsTokens.white,
  // Primary brand color for links, buttons, etc.
  primary: colorsTokens.gatsby,
  // A secondary brand color for alternative styling
  secondary: colorsTokens.purple[40],
  // A contrast color for emphasizing UI
  accent: colorsTokens.orange[60],
  // A faint color for backgrounds, borders, and accents that do not require high contrast with the background color
  muted: colorsTokens.grey[5],
  // end Theme-UI required keys

  // gatsby-design-tokens has the following in colors.text,
  // which conflicts with theme-ui's default color _text_
  // making text.header and text.secondary available as
  // _heading_ and _textMuted_ resolves that
  heading: colorsTokens.text.header, // text.header
  textMuted: colorsTokens.text.secondary, // text.secondary
}

// fonts
// theme-ui requires a CSS string
let f = {}
for (const fontFamily in fontsTokens) {
  f[fontFamily] = fontsTokens[fontFamily].join(`, `)
}

// we are targeting web, and choose to deliver these as _rem_, not px
// fontSizes
const fs = fontSizesTokens.map(token => pxToRem(token))
// space
const s = spaceTokens.map(token => pxToRem(token))

export const theme = {
  breakpoints: bp,
  colors: c,
  fonts: f,
  fontSizes: fs,
  space: s,
  fontWeights: fontWeightsTokens,
  letterSpacings: letterSpacingsTokens,
  lineHeights: lineHeightsTokens,
  mediaQueries: mediaQueriesTokens,
  radii: radiiTokens,
  shadows: shadowsTokens,
  transition: transitionTokens,
  zIndices: zIndicesTokens,
}

// individual exports
// breakpoints as array of pixel values (as opposed to object)
export { bp as breakpoints }
// colors extended with theme-ui required values
export { c as colors }
// fonts as CSS string (as opposed to array of font names)
export { f as fonts }
// fontSizes as `rem` (as opposed to pixels)
export { fs as fontSizes }
// space as `rem` (as opposed to pixels)
export { s as space }
// pass through unmodified tokens
export { fontWeightsTokens as fontWeights }
export { letterSpacingsTokens as letterSpacings }
export { lineHeightsTokens as lineHeights }
export { mediaQueriesTokens as mediaQueries }
export { radiiTokens as radii }
export { transitionTokens as transition }
export { shadowsTokens as shadows }
export { zIndicesTokens as zIndices }
