import preval from "preval.macro"

const fs = preval`
  let scale = [8]

  for (var i = 0; i < 18; i++) {
    scale[i + 1] = scale[i] + (parseInt((i - 2) / 4) + 1) * 2
  }

  // get rid of 8 and 10px font sizes
  scale.splice(0, 2)
  // rem
  const scaleRem = scale.map(t => t / 16 + "rem")

  module.exports = { scale, scaleRem }
`

export const fontSizes = fs.scale
export const fontSizesRem = fs.scaleRem
