import {
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
} from "./tokens"
import { rhythm } from "./typography"

const space = spaceTokens.map(token => rhythm(token))

let fonts = {}
for (let fontFamily in fontTokens) {
  fonts[fontFamily] = fontTokens[fontFamily].join(`,`)
}

const fontSizes = fontSizeTokens.map(token => `${token / 16}rem`)

const fontWeights = [400, 700, 800]
const borders = [0, `1px solid`, `2px solid`]

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
