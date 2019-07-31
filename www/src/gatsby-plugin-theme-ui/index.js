import hex2rgba from "hex2rgba"

// TODO all of _this_
import {
  // borders as b,
  breakpoints as bp,
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

let breakpointsTokens = []
for (let b in bp) {
  breakpointsTokens.push(bp[b])
}

let fontsTokens = {}
for (let fontFamily in f) {
  fontsTokens[fontFamily] = f[fontFamily].join(`, `)
}
// https://theme-ui.com/theme-spec#typography
// TODO decide whether to adjust keys in gatsby-design-tokens
fontsTokens.body = fontsTokens.system
fontsTokens.heading = fontsTokens.header

const fontSizesTokens = fs.map(token => `${token / 16}rem`)
const spaceTokens = sp.map(token => `${token / 16}rem`)

const lineHeightsTokens = {
  ...lh,
  body: lh.default,
  heading: lh.dense,
}

const darkBackground = `#131217` // meh
const darkBorder = c.grey[90]
// const darkBackground = c.purple[90]
// const darkBorder = c.purple[80]
const shadowDarkBase = `19,18,23`
const shadowDarkFlares = `0,0,0`

const col = {
  ...c,
  // https://theme-ui.com/theme-spec#color
  // Theme-UI required keys
  //
  // Body foreground color
  text: c.text.primary,
  // Body background color
  background: c.white,
  // Primary brand color for links, buttons, etc.
  primary: c.gatsby,
  // A secondary brand color for alternative styling
  secondary: c.purple[40],
  // A contrast color for emphasizing UI
  accent: c.orange[60],
  // A faint color for backgrounds, borders, and accents that do not require high contrast with the background color
  muted: c.grey[50],
  // end Theme-UI required keys
  banner: c.purple[70],
  // expand `gatsby-design-tokens` defaults
  code: {
    ...c.code,
    // refactor names
    background: c.code.bg,
    backgroundInline: c.code.bgInline,
    // modify token color values to comply to WCAG 2.0 AA standard contrast ratios
    // changed
    selector: `#b94185`,
    keyword: `#096fb3`,
    comment: `#527713`,
    tag: `#137886`,
    regex: `#dc0437`,
    // unchanged
    border: `#faede5`,
    text: `#866c5b`,
    remove: `#e45c5c`,
    add: `#4a9c59`,
    punctuation: `#53450e`,
    cssString: `#a2466c`,
    invisibles: `#e0d7d1`,
    // add a bunch of UI colors
    copyButton: c.grey[60],
    lineHighlightBackground: `#fbf0ea`,
    scrollbarTrack: `#faede5`,
  },
  ui: {
    background: c.grey[5],
    hover: c.purple[5],
    border: c.grey[20],
  },
  link: {
    color: c.purple[50],
    border: c.purple[30],
    hoverBorder: c.purple[50],
    hoverColor: c.purple[60],
  },
  text: {
    header: c.black,
    primary: c.grey[80],
    secondary: c.grey[50],
    // moved placeholder to `input`
  },
  input: {
    background: c.white,
    backgroundFocus: c.white,
    border: c.grey[30],
    focusBorder: c.purple[30],
    focusBoxShadow: c.purple[20],
    icon: c.grey[50],
    iconFocus: c.grey[60],
    placeholder: c.grey[40],
  },
  // new tokens
  card: {
    background: c.white,
    color: c.grey[50],
    header: c.black,
  },
  modal: {
    background: c.white,
    overlayBackground: hex2rgba(c.white, 0.975),
  },
  navigation: {
    background: hex2rgba(c.white, 0.975),
    linkDefault: c.grey[70],
    linkActive: c.black,
    linkHover: c.gatsby,
    socialLink: c.grey[40],
  },
  search: {
    suggestionHighlightBackground: c.lavender,
    suggestionHighlightColor: c.gatsby,
  },
  sidebar: {
    itemHoverBackground: hex2rgba(c.purple[20], 0.275),
    itemBackgroundActive: `transparent`,
    itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
    activeSectionBackground: hex2rgba(c.purple[20], 0.15),
    itemBorderActive: c.purple[10],
  },
  themedInput: {
    background: c.grey[10],
    backgroundFocus: c.white,
    focusBorder: c.purple[60],
    focusBoxShadow: c.purple[30],
    icon: c.grey[50],
    iconFocus: c.grey[60],
    placeholder: c.grey[60],
  },
  widget: {
    background: c.white,
    color: c.text.primary,
  },
  // ref. e.g. https://github.com/system-ui/theme-ui/blob/702c43e804046a94389e7a12a8bba4c4f436b14e/packages/presets/src/tailwind.js#L6
  // transparent: `transparent`,
  modes: {
    dark: {
      background: darkBackground,
      text: c.grey[20],
      banner: hex2rgba(c.purple[90], 0.975),
      card: {
        background: c.purple[90],
        color: c.whiteFade[70],
        header: c.white,
      },
      modal: {
        background: darkBackground,
        overlayBackground: hex2rgba(darkBackground, 0.975),
      },
      code: {
        // ui
        background: darkBorder,
        backgroundInline: darkBorder,
        border: c.grey[80],
        lineHighlightBackground: hex2rgba(c.blue[90], 0.125),
        lineHighlightBorder: c.blue[90],
        scrollbarThumb: c.grey[70],
        scrollbarTrack: c.grey[90],
        copyButton: c.grey[40],
        // tokens
        add: c.green[50],
        comment: c.grey[30],
        cssString: c.orange[50],
        invisibles: `#e0d7d1`,
        keyword: c.magenta[30],
        punctuation: c.whiteFade[70],
        regex: `#d88489`,
        remove: c.red[60],
        selector: c.orange[30],
        tag: c.teal[60],
        text: c.grey[30],
      },
      link: {
        border: c.purple[90],
        color: c.purple[40],
        hoverBorder: c.purple[70],
        hoverColor: c.purple[30],
      },
      navigation: {
        background: hex2rgba(darkBackground, 0.975),
        linkActive: c.purple[40],
        linkDefault: c.whiteFade[60],
        linkHover: c.white,
        socialLink: c.grey[60],
      },
      themedInput: {
        background: darkBorder,
        backgroundFocus: hex2rgba(c.purple[90], 0.25),
        focusBorder: c.purple[80],
        focusBoxShadow: c.purple[90],
        icon: c.grey[50],
        iconFocus: c.whiteFade[70],
        placeholder: c.whiteFade[50],
      },
      // TODO figure out how to make shadows themeable
      shadows: {
        dialog: `0px 4px 16px rgba(${shadowDarkBase}, 0.08), 0px 8px 24px rgba(${shadowDarkFlares}, 0.16)`,
        floating: `0px 2px 4px rgba(${shadowDarkBase}, 0.08), 0px 4px 8px rgba(${shadowDarkFlares}, 0.16)`,
        overlay: `0px 4px 8px rgba(${shadowDarkBase}, 0.08), 0px 8px 16px rgba(${shadowDarkFlares}, 0.16)`,
        raised: `0px 1px 2px rgba(${shadowDarkBase}, 0.08), 0px 2px 4px rgba(${shadowDarkFlares}, 0.08)`,
      },
      sidebar: {
        itemBackgroundActive: `transparent`,
        activeSectionBackground: hex2rgba(c.purple[90], 0.2),
        itemBorderActive: c.purple[80],
        itemBorderColor: `transparent`,
        itemHoverBackground: hex2rgba(c.purple[90], 0.2),
      },
      text: {
        header: c.white,
        primary: c.grey[20],
        secondary: c.grey[40],
      },
      ui: {
        background: darkBackground,
        hover: c.purple[5],
        border: darkBorder,
      },
      widget: {
        background: darkBackground,
        border: darkBorder,
        color: c.white,
      },
      search: {
        suggestionHighlightBackground: c.gatsby,
        suggestionHighlightColor: c.purple[20],
      },
    },
  },
}

const si = {
  ...s,
  // TODO remove `sizes` from `gatsby-design-tokens`
  // until we eventually have well-defined components,
  // it doesn't make sense to store these tokens in
  // the package
  headerHeight: `4rem`,
  logo: spaceTokens[6],
  pluginsSidebarWidthDefault: `21rem`,
  pluginsSidebarWidthLarge: `24rem`,
  showcaseSidebarMaxWidth: `15rem`,
  sidebarItemMinHeight: spaceTokens[8],
  mainContentWidth: {
    default: `54rem`,
    withSidebar: `42rem`,
  },
  sidebarWidth: {
    default: `16.5rem`,
    large: `18rem`,
    mobile: `320px`,
  },
  tocWidth: `18rem`,
}

// export const borders = b
export const breakpoints = breakpointsTokens
export const colors = col
export const fonts = fontsTokens
export const fontSizes = fontSizesTokens
export const fontWeights = fw
export const letterSpacings = ls
export const lineHeights = lineHeightsTokens
export const mediaQueries = mq
export const radii = r
export const shadows = sh
export const sizes = si
export const space = spaceTokens
export const transition = t
export const zIndices = z

const config = {
  // this enables the color modes feature
  // and is used as the name for the top-level colors object
  initialColorMode: `light`,
  // use CSS custom properties to help avoid flash of colors on initial page load
  // useCustomProperties: true,
  // borders: borders,
  breakpoints: breakpointsTokens,
  colors: col,
  fonts: fontsTokens,
  fontSizes: fontSizesTokens,
  fontWeights: fw,
  letterSpacings: ls,
  lineHeights: lineHeightsTokens,
  mediaQueries: mq,
  radii: r,
  shadows: sh,
  sizes: si,
  space: spaceTokens,
  transition: t,
  zIndices: z,
}
console.log(`TOKENS`, config)

export default config
