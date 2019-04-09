import {
  breakpoints,
  colors,
  sizes,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  space as spaceTokens,
  fontSizes,
  transition,
  fonts as fontTokens,
} from "./tokens"
import { rhythm } from "./typography"

const space = spaceTokens.map(token => rhythm(token))
let fonts = {}

for (let fontFamily in fontTokens) {
  fonts[fontFamily] = fontTokens[fontFamily].join(`,`)
}

export {
  breakpoints,
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
}
