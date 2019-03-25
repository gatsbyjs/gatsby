import { colors, space } from "../../utils/presets"
import hex2rgba from "hex2rgba"

export default {
  backgroundDefault: colors.white,
  backgroundTablet: hex2rgba(colors.ui.bright, 0.075),
  itemHoverBackground: hex2rgba(colors.ui.bright, 0.275),
  itemMinHeight: space[8],
  itemBorderColor: `transparent`,
  activeSectionBackground: hex2rgba(colors.ui.bright, 0.275),
}
