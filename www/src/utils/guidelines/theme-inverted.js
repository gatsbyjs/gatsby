import theme from "./theme"
import { cloneDeep } from "lodash-es"
import Color from "color"

let themeInverted = cloneDeep(theme)

const blacks = themeInverted.colors.black
themeInverted.colors.black = themeInverted.colors.white
themeInverted.colors.white = blacks

const blackFade = themeInverted.colors.whiteFade
themeInverted.colors.blackFade = themeInverted.colors.whiteFade
themeInverted.colors.whiteFade = blackFade

Object.keys(themeInverted.colors.grey)
  .sort((a, b) => b - a)
  .forEach((color, index) => {
    let rgb = Color(themeInverted.colors.grey[color])
      .rgb()
      .array()

    for (var i = 0; i < rgb.length; i++) {
      rgb[i] = (i === 3 ? 1 : 255) - rgb[i]
    }

    themeInverted.colors.grey[color] = `rgba(255, 255, 255, ${rgb.length -
      index / 10 -
      2})`
  })

export default themeInverted
