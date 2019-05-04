import { colors, space } from "../../utils/presets"
import hex2rgba from "hex2rgba"

export default {
  backgroundDefault: colors.white,
  backgroundTablet: colors.white,
  itemHoverBackground: hex2rgba(colors.ui.bright, 0.275),
  activeItemBackground: `transparent`,
  itemMinHeight: space[8],
  itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
  activeSectionBackground: hex2rgba(colors.ui.bright, 0.15),
}
