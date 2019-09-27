import preval from "preval.macro"

// scale
export default preval`
  let scale = [8]

  for (var i = 0; i < 18; i++) {
    scale[i + 1] = scale[i] + (parseInt((i - 2) / 4) + 1) * 2
  }

  // get rid of 8 and 10px font sizes
  scale.splice(0, 2)

  module.exports = scale
`
