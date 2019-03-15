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
} from "./tokens"
import { rhythm } from "./typography"

const space = spaceTokens.map(token => rhythm(token))

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
}
