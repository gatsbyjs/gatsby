import hex2rgba from "hex2rgba"

import { colors, space } from "../../utils/presets"

export default {
  backgroundDefault: colors.white,
  backgroundTablet: colors.white,
  itemHoverBackground: hex2rgba(colors.purple[20], 0.275),
  activeItemBackground: `transparent`,
  itemMinHeight: space[8],
  itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
  activeSectionBackground: hex2rgba(colors.purple[20], 0.15),
}
