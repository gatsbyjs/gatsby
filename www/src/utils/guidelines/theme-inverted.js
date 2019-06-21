import theme from "./theme"
import { cloneDeep } from "lodash-es"

let themeInverted = cloneDeep(theme)

themeInverted.colors.black = theme.colors.white
themeInverted.colors.white = theme.colors.black

themeInverted.colors.blackFade = theme.colors.whiteFade
themeInverted.colors.whiteFade = theme.colors.blackFade

// cheap, and not ready for production :)
Object.keys(themeInverted.colors.grey)
  .sort((a, b) => b - a)
  .forEach((color, index) => {
    themeInverted.colors.grey[color] = `rgba(255, 255, 255, ${(Object.keys(
      themeInverted.colors.grey
    ).length -
      index) /
      10})`
  })

export default themeInverted
