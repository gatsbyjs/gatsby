import {
  breakpoints,
  colors,
  dimensions,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  space as spaceTokens,
  scale,
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
  dimensions,
  transition,
  radii,
  shadows,
  letterSpacings,
  lineHeights,
  space,
  scale,
  fonts,
}
