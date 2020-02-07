import preval from "preval.macro"

const s = preval`
  const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72]
  const spaceRem = space.map(t => t / 16 + "rem")

  module.exports = { space, spaceRem }
`

export const space = s.space
export const spaceRem = s.spaceRem
