import { space } from "gatsby-design-tokens"

const pxToRem = pixels => `${pixels / 16}rem`

const indention = level =>
  level === 0 || level === 1 ? pxToRem(space[6]) : pxToRem(level * space[6])

export default indention
