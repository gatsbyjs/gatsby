import { style } from "glamor"
import { rhythm } from "../utils/typography"
import { colors } from "./colors"
import presets from "../utils/presets"

const animations = {
  animationCurveFastOutSlowIn: `cubic-bezier(0.4, 0, 0.2, 1)`,
  animationCurveLinearOutSlowIn: `cubic-bezier(0, 0, 0.2, 1)`,
  animationCurveFastOutLinearIn: `cubic-bezier(0.4, 0, 1, 1)`,
  animationCurveDefault: `cubic-bezier(0.4, 0, 0.2, 1)`,
  animationSpeedDefault: `250ms`,
  animationSpeedFast: `200ms`,
  animationSpeedSlow: `300ms`,
}

export default {
  animations: animations,
  colors: colors,
  verticalPadding: style({
    padding: rhythm(3 / 4),
  }),
  container: style({
    maxWidth: `37rem`,
    margin: `0 auto`
  }),
}
