import { space } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

// :)
const remToPx = rem => parseFloat(rem) * 16
const pxToRem = pixels => `${pixels / 16}rem`

const indention = level =>
  level === 0 || level === 1 ? space[6] : pxToRem(level * remToPx(space[6]))

export default indention
