import {
  breakpointsArray as breakpoints,
  colors as colorsTokens,
  borders,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  space,
  radii,
  transition,
  shadows,
} from "./index"

// gatsby-theme-ui-theme-default
// provides a theme-ui theme using gatsby-design-tokens

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

export const theme = {
  borders,
  breakpoints,
  colors: c,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transition,
}

export {
  c as colors,
  borders,
  breakpoints,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transition,
}
