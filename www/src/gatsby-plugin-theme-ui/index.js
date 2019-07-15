import hex2rgba from "hex2rgba"
import {
  colors,
  breakpoints,
  mediaQueries,
  sizes,
  letterSpacings,
  lineHeights,
  radii,
  shadows,
  space,
  fontSizes,
  transition,
  fonts,
  zIndices,
  fontWeights,
} from "../utils/presets"

export default {
  // this enables the color modes feature
  // and is used as the name for the top-level colors object
  initialColorMode: `light`,
  colors: {
    text: colors.grey[90],
    background: colors.white,
    navigation: {
      background: `rgba(255,255,255,0.975)`,
      linkDefault: colors.grey[50],
      linkActive: colors.black,
      linkHover: colors.gatsby,
    },
    sidebar: {
      itemHoverBackground: hex2rgba(colors.purple[20], 0.275),
      activeItemBackground: `transparent`,
      itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
      activeSectionBackground: hex2rgba(colors.purple[20], 0.15),
      itemBorderActive: colors.purple[10],
    },
    ...colors,
    modes: {
      dark: {
        text: colors.white,
        background: colors.grey[90],
        navigation: {
          background: `rgba(35,33,41,0.975)`,
          linkDefault: colors.grey[40],
          linkActive: colors.purple[40],
          linkHover: colors.white,
        },
        text: {
          header: colors.white,
          primary: colors.white,
        },
        link: {
          color: colors.purple[50],
          border: colors.purple[80],
          hoverBorder: colors.purple[50],
          hoverColor: colors.purple[70],
        },
        ui: {
          border: {
            subtle: colors.grey[80],
          },
        },
        sidebar: {
          itemHoverBackground: hex2rgba(colors.purple[70], 0.275),
          activeItemBackground: `transparent`,
          itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
          activeSectionBackground: hex2rgba(colors.purple[70], 0.15),
          itemBorderActive: colors.purple[80],
        },
      },
    },
  },
  sizes: {
    ...sizes,
    logo: space[6],
    sidebarItemMinHeight: space[8],
    pluginsSidebarWidthDefault: `21rem`,
    pluginsSidebarWidthLarge: `24rem`,
  },
  zIndices: zIndices,
  space: space,
  radii: radii,
  shadows: shadows,
  fontSizes: fontSizes,
  fonts: fonts,
  letterSpacings: letterSpacings,
  transition: transition,
  fontWeights: fontWeights,
}
