import hex2rgba from "hex2rgba"

// ugly
import {
  borders as b,
  breakpoints as bps,
  colors as c,
  fonts as f,
  fontSizes as fs,
  fontWeights as fw,
  letterSpacings as ls,
  lineHeights as lh,
  mediaQueries as mq,
  radii as r,
  shadows as sh,
  sizes as s,
  space as sp,
  transition as t,
  zIndices as z,
} from "gatsby-design-tokens"

let breakps = []
for (let bp in bps) {
  breakps.push(bps[bp])
}

let fnts = {}
for (let fontFamily in f) {
  fnts[fontFamily] = f[fontFamily].join(`, `)
}

const fntsi = fs.map(token => `${token / 16}rem`)
const spc = sp.map(token => `${token / 16}rem`)

const darkBackground = `#0c0b0e` // meh
const darkBorder = `#131217`
const shadowDarkBase = `19,18,23`
const shadowDarkFlares = `0,0,0`

const si = {
  ...s,
  logo: spc[6],
  sidebarItemMinHeight: spc[8],
  pluginsSidebarWidthDefault: `21rem`,
  pluginsSidebarWidthLarge: `24rem`,
  showcaseSidebarMaxWidth: `15rem`,
  mainContentWidth: {
    default: `54rem`,
    withSidebar: `42rem`,
  },
  sidebarWidth: {
    mobile: `320px`,
    default: `16.5rem`,
    large: `18rem`,
  },
  mainContentWidth: {
    default: `54rem`,
    withSidebar: `42rem`,
  },
  tocWidth: `18rem`,
}

export const borders = b
export const breakpoints = breakps
export const colors = c
export const fonts = fnts
export const fontSizes = fntsi
export const fontWeights = fw
export const letterSpacings = ls
export const lineHeights = lh
export const mediaQueries = mq
export const radii = r
export const shadows = sh
export const sizes = si
export const space = spc
export const transition = t
export const zIndices = z

export default {
  // this enables the color modes feature
  // and is used as the name for the top-level colors object
  initialColorMode: `light`,
  // use CSS custom properties to help avoid flash of colors on initial page load
  // useCustomProperties: true,
  borders: borders,
  colors: {
    ...c,
    // lots to consolidate here
    banner: c.purple[70],
    // ref. e.g. https://github.com/system-ui/theme-ui/blob/702c43e804046a94389e7a12a8bba4c4f436b14e/packages/presets/src/tailwind.js#L6
    // transparent: `transparent`,
    background: c.white,
    card: {
      background: c.white,
      header: c.black,
      color: c.grey[50],
    },
    widget: {
      background: c.white,
      color: c.text.primary,
    },
    navigation: {
      background: `rgba(255,255,255,0.975)`,
      linkDefault: c.grey[50],
      linkActive: c.black,
      linkHover: c.gatsby,
      socialLink: c.grey[40],
      searchBackground: c.grey[10],
      searchBackgroundFocus: c.white,
      searchIcon: c.grey[50],
      searchIconFocus: c.grey[60],
      searchPlaceholder: c.grey[60],
    },
    sidebar: {
      itemHoverBackground: hex2rgba(c.purple[20], 0.275),
      activeItemBackground: `transparent`,
      itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
      activeSectionBackground: hex2rgba(c.purple[20], 0.15),
      itemBorderActive: c.purple[10],
    },
    modes: {
      dark: {
        widget: {
          background: c.grey[90],
          color: c.white,
        },
        banner: c.purple[90],
        background: darkBackground,
        navigation: {
          background: hex2rgba(darkBackground, 0.975),
          linkDefault: c.whiteFade[50],
          linkActive: c.purple[40],
          socialLink: c.grey[60],
          linkHover: c.white,
          searchBackground: darkBorder,
          searchBackgroundFocus: darkBackground,
          searchIcon: c.grey[50],
          searchIconFocus: c.grey[40],
          searchPlaceholder: c.grey[50],
        },
        card: {
          background: c.purple[90],
          header: c.white,
          color: c.whiteFade[60],
        },
        text: {
          header: c.white,
          primary: c.grey[30],
          secondary: c.grey[50],
        },
        link: {
          color: c.purple[40],
          border: c.purple[90],
          hoverBorder: c.purple[70],
          hoverColor: c.purple[30],
        },
        ui: {
          background: darkBackground,
          border: {
            subtle: darkBorder,
          },
        },
        sidebar: {
          itemHoverBackground: hex2rgba(c.purple[90], 0.2),
          activeItemBackground: `transparent`,
          itemBorderColor: `transparent`,
          activeSectionBackground: hex2rgba(c.purple[90], 0.2),
          itemBorderActive: c.purple[80],
        },
        shadows: {
          dialog: `0px 4px 16px rgba(${shadowDarkBase}, 0.08), 0px 8px 24px rgba(${shadowDarkFlares}, 0.16)`,
          floating: `0px 2px 4px rgba(${shadowDarkBase}, 0.08), 0px 4px 8px rgba(${shadowDarkFlares}, 0.16)`,
          overlay: `0px 4px 8px rgba(${shadowDarkBase}, 0.08), 0px 8px 16px rgba(${shadowDarkFlares}, 0.16)`,
          raised: `0px 1px 2px rgba(${shadowDarkBase}, 0.08), 0px 2px 4px rgba(${shadowDarkFlares}, 0.08)`,
        },
        code: {
          bg: darkBorder,
          bgInline: darkBorder,
          border: darkBackground,
          lineHighlightBorder: c.teal[90],
          lineHighlightBackground: hex2rgba(c.teal[90], 0.25),
          punctuation: c.whiteFade[60],
          add: c.green[50],
          comment: c.grey[30],
          cssString: `#a2466c`,
          invisibles: `#e0d7d1`,
          keyword: c.magenta[40],
          regex: `#d88489`,
          remove: `#e45c5c`,
          scrollbarThumb: c.purple[90],
          selector: c.orange[30],
          tag: c.teal[60],
          text: c.grey[30],
        },
      },
    },
  },
  fonts: fnts,
  fontSizes: fntsi,
  fontWeights: fw,
  letterSpacings: ls,
  radii: r,
  sizes: si,
  shadows: sh,
  space: spc,
  transition: t,
  zIndices: z,
  lineHeights: lh,
  mediaQueries: mq,
  breakpoints: breakps,
}
