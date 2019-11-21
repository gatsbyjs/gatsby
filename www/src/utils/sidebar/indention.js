import { space } from "../../gatsby-plugin-theme-ui"

// :)
const remToPx = rem => parseFloat(rem) * 16
const pxToRem = pixels => `${pixels / 16}rem`

const indention = level =>
  level === 0 || level === 1 ? space[6] : pxToRem(level * remToPx(space[6]))

export default indention
