import hex2rgba from "hex2rgba"
import {
  borders,
  breakpoints,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  sizes,
  space,
  transition,
  zIndices,
} from "../utils/presets"

const darkBackground = `#0c0b0e` // meh
const darkBorder = `#131217`

const shadowDarkBase = `#131217`
const shadowDarkFlares = colors.black

// const darkBackground = `#131217`
// const darkBorder = colors.grey[90]

export default {
  // this enables the color modes feature
  // and is used as the name for the top-level colors object
  initialColorMode: `light`,
  // use CSS custom properties to help avoid flash of colors on initial page load
  // useCustomProperties: true,
  borders: borders,
  colors: {
    ...colors,
    banner: colors.purple[70],
    // ref. e.g. https://github.com/system-ui/theme-ui/blob/702c43e804046a94389e7a12a8bba4c4f436b14e/packages/presets/src/tailwind.js#L6
    // transparent: `transparent`,
    background: colors.white,
    card: {
      background: colors.white,
      header: colors.black,
      color: colors.grey[50],
    },
    widget: {
      background: colors.white,
      color: colors.text.primary,
    },
    navigation: {
      background: `rgba(255,255,255,0.975)`,
      linkDefault: colors.grey[50],
      linkActive: colors.black,
      linkHover: colors.gatsby,
      socialLink: colors.grey[40],
      searchBackground: colors.grey[10],
      searchBackgroundFocus: colors.white,
      searchIcon: colors.grey[50],
      searchIconFocus: colors.purple[40],
      searchPlaceholder: colors.grey[60],
    },
    sidebar: {
      itemHoverBackground: hex2rgba(colors.purple[20], 0.275),
      activeItemBackground: `transparent`,
      itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
      activeSectionBackground: hex2rgba(colors.purple[20], 0.15),
      itemBorderActive: colors.purple[10],
    },
    modes: {
      dark: {
        widget: {
          background: colors.grey[90],
          color: colors.white,
        },
        banner: colors.purple[90],
        background: darkBackground,
        navigation: {
          background: hex2rgba(darkBackground, 0.975),
          // background: colors.purple[90],
          linkDefault: colors.whiteFade[50],
          linkActive: colors.purple[40],
          socialLink: colors.grey[60],
          linkHover: colors.white,
          searchBackground: darkBorder,
          searchBackgroundFocus: darkBackground,
          searchIcon: colors.grey[50],
          searchIconFocus: colors.grey[40],
          searchPlaceholder: colors.grey[50],
        },
        card: {
          background: colors.purple[90],
          header: colors.white,
          color: colors.purple[90],
        },
        text: {
          header: colors.white,
          primary: colors.grey[30],
          secondary: colors.grey[50],
        },
        link: {
          color: colors.purple[40],
          border: colors.purple[90],
          hoverBorder: colors.purple[70],
          hoverColor: colors.purple[30],
        },
        ui: {
          border: {
            subtle: darkBorder,
          },
          background: darkBackground,
        },
        sidebar: {
          itemHoverBackground: hex2rgba(colors.purple[70], 0.275),
          activeItemBackground: `transparent`,
          itemBorderColor: `transparent`,
          activeSectionBackground: hex2rgba(colors.purple[70], 0.275),
          itemBorderActive: colors.purple[80],
        },
        shadows: {
          dialog: `0px 4px 16px rgba(${shadowDarkBase}, 0.08), 0px 8px 24px rgba(${shadowDarkFlares}, 0.16)`,
          floating: `0px 2px 4px rgba(${shadowDarkBase}, 0.08), 0px 4px 8px rgba(${shadowDarkFlares}, 0.16)`,
          overlay: `0px 4px 8px rgba(${shadowDarkBase}, 0.08), 0px 8px 16px rgba(${shadowDarkFlares}, 0.16)`,
          raised: `0px 1px 2px rgba(${shadowDarkBase}, 0.08), 0px 2px 4px rgba(${shadowDarkFlares}, 0.08)`,
        },
      },
    },
  },
  fonts: fonts,
  fontSizes: fontSizes,
  fontWeights: fontWeights,
  letterSpacings: letterSpacings,
  radii: radii,
  sizes: {
    ...sizes,
    logo: space[6],
    sidebarItemMinHeight: space[8],
    pluginsSidebarWidthDefault: `21rem`,
    pluginsSidebarWidthLarge: `24rem`,
  },
  shadows: shadows,
  space: space,
  transition: transition,
  zIndices: zIndices,
  styles: {
    h2: {
      fontSize: 5,
    },
    root: {
      html: {
        color: `#ff9`,
      },
    },
  },
  lineHeights: lineHeights,
  mediaQueries: mediaQueries,
}
