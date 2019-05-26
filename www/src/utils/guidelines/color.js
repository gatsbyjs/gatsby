import Color from "color"

import theme from "./theme"

// adapted from https://github.com/jxnblk/colorable 🙏
var minimums = {
  aa: 4.5,
  aaLarge: 3,
  aaa: 7,
  aaaLarge: 4.5,
}

export const colorable = function(hex) {
  let result = {}

  const color = Color(hex)
  const white = Color(theme.colors.white)
  const black = Color(theme.colors.black)

  result.hex = color.hex()
  result.contrast = {
    colorOnWhite: color.contrast(white),
    whiteOnColor: white.contrast(color),
    blackOnColor: black.contrast(color),
  }
  result.accessibility = {
    aa: result.contrast.colorOnWhite >= minimums.aa,
    aaLarge: result.contrast.colorOnWhite >= minimums.aaLarge,
    aaa: result.contrast.colorOnWhite >= minimums.aaa,
    aaaLarge: result.contrast.colorOnWhite >= minimums.aaaLarge,
  }

  return result
}

export const getAccessibilityLabel = (color, compact) => {
  let label = compact ? `×` : `Fail`

  if (
    color.accessibility.aaa ||
    color.accessibility.aa ||
    color.accessibility.aaLarge
  ) {
    if (color.accessibility.aaa) {
      label = compact ? `3` : `AAA`
    } else if (color.accessibility.aa) {
      label = compact ? `2` : `AA`
    } else if (color.accessibility.aaLarge) {
      label = compact ? `2+` : `Large`
    }
  }

  return label
}

export const getTextColor = contrast =>
  contrast.blackOnColor < contrast.whiteOnColor ? `white` : `black`
