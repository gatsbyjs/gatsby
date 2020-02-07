import preval from "preval.macro"

const s = preval`
  const space = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72]
  let spacePx = space.map(t => t + "px")
  let spaceRem = space.map(t => t / 16 + "rem")
  spacePx[0] = spaceRem[0] = 0

  module.exports = { space, spacePx, spaceRem }
`

export const space = s.space
export const spacePx = s.spacePx
export const spaceRem = s.spaceRem
