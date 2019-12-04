import { rgb as wcag } from "wcag-contrast"
import hexRgb from "hex-rgb"
import { normal } from "color-blend"

import { colors } from "../../gatsby-plugin-theme-ui"

// adapted from https://github.com/jxnblk/colorable 🙏
const minimums = {
  aa: 4.5,
  aaLarge: 3,
  aaa: 7,
  aaaLarge: 4.5,
}

const rgbArray = color => {
  const pars = color.indexOf(`,`)
  const repars = color.indexOf(`,`, pars + 1)

  return [
    parseInt(color.substr(5, pars)),
    parseInt(color.substr(pars + 1, repars)),
    parseInt(
      color.substr(color.indexOf(`,`, pars + 1) + 1, color.indexOf(`,`, repars))
    ),
    parseFloat(
      color.substr(color.indexOf(`,`, repars + 1) + 1, color.indexOf(`)`))
    ),
  ]
}

const colorToHex = color =>
  color.startsWith(`rgba(`)
    ? rgbArray(color)
    : hexRgb(color, { format: `array` })

export const a11y = function(hex, bg) {
  const text = colorToHex(hex)
  const background = colorToHex(bg)

  // not 100% sure how well this works — values are slightly different
  // than what https://contrast-ratio.com/ produces when the text
  // color is an rgba value; contrast ratios for solid colors seem fine
  const overlaid = normal(
    {
      r: background[0],
      g: background[1],
      b: background[2],
      a: background[3],
    },
    { r: text[0], g: text[1], b: text[2], a: text[3] }
  )

  const contrast = wcag(
    [overlaid.r, overlaid.g, overlaid.b],
    [background[0], background[1], background[2]]
  )

  return {
    contrast: contrast,
    aa: contrast >= minimums.aa,
    aaLarge: contrast >= minimums.aaLarge,
    aaa: contrast >= minimums.aaa,
    aaaLarge: contrast >= minimums.aaaLarge,
  }
}

export const colorable = function(hex) {
  let result = {}

  result.hex = hex
  result.rgb = hexRgb(hex)
  const rgbArray = [result.rgb.red, result.rgb.green, result.rgb.blue]

  result.contrast = {
    colorOnWhite: wcag(rgbArray, [255, 255, 255]),
    whiteOnColor: wcag([255, 255, 255], rgbArray),
    blackOnColor: wcag([0, 0, 0], rgbArray),
  }

  result.a11y = {
    ...a11y(hex, colors.white),
  }

  return result
}

export const getA11yLabel = (color, compact) => {
  let label = compact ? `×` : `Fail`

  if (color.aaa || color.aa || color.aaLarge) {
    if (color.aaa) {
      label = compact ? `3` : `AAA`
    } else if (color.aa) {
      label = compact ? `2` : `AA`
    } else if (color.aaLarge) {
      label = compact ? `2+` : `AA Large`
    }
  }

  return label
}

export const getTextColor = contrast =>
  contrast.blackOnColor < contrast.whiteOnColor ? `white` : `black`
