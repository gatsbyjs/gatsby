import {
  borders,
  breakpoints,
  mediaQueries,
  colors,
  sizes,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  space as spaceTokens,
  fontSizes as fontSizeTokens,
  transition,
  fonts as fontTokens,
  zIndices,
  fontWeights,
} from "gatsby-design-tokens"

let fonts = {}
for (let fontFamily in fontTokens) {
  fonts[fontFamily] = fontTokens[fontFamily].join(`, `)
}

const fontSizes = fontSizeTokens.map(token => `${token / 16}rem`)
const space = spaceTokens.map(token => `${token / 16}rem`)

export {
  breakpoints,
  mediaQueries,
  colors,
  sizes,
  transition,
  radii,
  shadows,
  letterSpacings,
  lineHeights,
  space,
  fontSizes,
  fonts,
  zIndices,
  fontWeights,
  borders,
}
