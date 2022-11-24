import hex2rgba from "hex2rgba"

import {
  theme as defaultTheme,
  colors as colorsTokens,
  space as spaceTokens,
} from "./theme"

// gatsby-theme-ui-theme-gatsbyjs-org
// extends gatsby-theme-ui-theme-default

const darkBackground = `#131217` // meh
const darkBorder = colorsTokens.grey[90]
const shadowDarkBase = `19,18,23`
const shadowDarkFlares = `0,0,0`

// colors
// provides a "dark" mode along the initial color mode "light"
const c = {
  ...colorsTokens,
  // gatsbyjs.com specific stuff
  banner: colorsTokens.purple[70],
  // moved `text.placeholder` to `input.placeholder`
  // ref. e.g. https://github.com/system-ui/theme-ui/blob/702c43e804046a94389e7a12a8bba4c4f436b14e/packages/presets/src/tailwind.js#L6
  // transparent: `transparent`,
  // expand `gatsby-design-tokens` defaults
  ui: {
    background: colorsTokens.grey[5],
    hover: colorsTokens.purple[5],
    border: colorsTokens.grey[20],
  },
  link: {
    color: colorsTokens.purple[50],
    border: colorsTokens.purple[30],
    hoverBorder: colorsTokens.purple[50],
    hoverColor: colorsTokens.purple[60],
  },
  icon: {
    dark: colorsTokens.purple[60],
    neutral: colorsTokens.grey[50],
    neutralLight: colorsTokens.grey[30],
    background: colorsTokens.white,
    accent: colorsTokens.yellow[60],
    light: colorsTokens.purple[10],
    lightActive: colorsTokens.purple[20],
  },
  input: {
    background: colorsTokens.white,
    backgroundFocus: colorsTokens.white,
    border: colorsTokens.grey[30],
    focusBorder: colorsTokens.white,
    focusBoxShadow: colorsTokens.purple[60],
    icon: colorsTokens.grey[50],
    iconFocus: colorsTokens.grey[60],
    placeholder: colorsTokens.text.placeholder,
  },
  // new tokens
  card: {
    background: colorsTokens.white,
    color: colorsTokens.grey[50],
    header: colorsTokens.black,
    starterLabelBackground: colorsTokens.teal[5],
    starterLabelText: colorsTokens.teal[70],
    pluginLabelBackground: colorsTokens.orange[5],
    pluginLabelText: colorsTokens.orange[90],
  },
  modal: {
    background: colorsTokens.white,
    overlayBackground: hex2rgba(colorsTokens.white, 0.95),
  },
  navigation: {
    background: hex2rgba(colorsTokens.white, 0.985),
    linkDefault: colorsTokens.grey[70],
    linkActive: colorsTokens.purple[50],
    linkHover: colorsTokens.gatsby,
    socialLink: colorsTokens.grey[50],
  },
  search: {
    suggestionHighlightBackground: colorsTokens.lavender,
    suggestionHighlightColor: colorsTokens.gatsby,
  },
  sidebar: {
    itemHoverBackground: hex2rgba(colorsTokens.purple[20], 0.275),
    itemBackgroundActive: `transparent`,
    itemBorderColor: `transparent`, // `rgba(0,0,0,0.05)`,
    activeSectionBackground: hex2rgba(colorsTokens.purple[20], 0.15),
    itemBorderActive: colorsTokens.purple[10],
  },
  themedInput: {
    background: colorsTokens.grey[10],
    backgroundFocus: colorsTokens.white,
    focusBorder: colorsTokens.purple[60],
    focusBoxShadow: colorsTokens.purple[30],
    icon: colorsTokens.grey[50],
    iconFocus: colorsTokens.grey[60],
    placeholder: colorsTokens.grey[60],
  },
  widget: {
    border: colorsTokens.grey[10],
    background: colorsTokens.white,
    color: colorsTokens.text.primary,
  },
  highlightedBox: {
    background: colorsTokens.yellow[10],
    color: colorsTokens.grey[80],
  },
  newsletter: {
    background: colorsTokens.white,
    border: colorsTokens.grey[10],
    heading: colorsTokens.grey[70],
    stripeColorA: colorsTokens.red[40],
    stripeColorB: colorsTokens.blue[40],
  },
  button: {
    primaryBg: colorsTokens.purple[60],
    primaryText: colorsTokens.white,
    primaryBorder: colorsTokens.purple[60],
    secondaryBg: `transparent`,
    secondaryText: colorsTokens.purple[50],
    secondaryBorder: colorsTokens.purple[40],
  },
  pullquote: {
    color: colorsTokens.purple[60],
    borderColor: colorsTokens.purple[20],
  },
  modes: {
    dark: {
      background: darkBackground,
      text: colorsTokens.grey[30],
      heading: colorsTokens.whiteFade[80],
      textMuted: colorsTokens.grey[40],
      banner: hex2rgba(colorsTokens.purple[90], 0.975),
      muted: colorsTokens.grey[90],
      icon: {
        dark: colorsTokens.purple[50],
        neutral: colorsTokens.grey[70],
        neutralLight: colorsTokens.grey[90],
        background: colorsTokens.darkBorder,
        accent: colorsTokens.yellow[50],
        light: colorsTokens.grey[90],
        lightActive: colorsTokens.purple[90],
      },
      card: {
        background: colorsTokens.grey[90],
        color: colorsTokens.whiteFade[70],
        header: colorsTokens.white,
        starterLabelBackground: hex2rgba(colorsTokens.teal[90], 0.125),
        starterLabelText: colorsTokens.teal[10],
        pluginLabelBackground: hex2rgba(colorsTokens.orange[90], 0.125),
        pluginLabelText: colorsTokens.orange[10],
      },
      modal: {
        background: darkBackground,
        overlayBackground: hex2rgba(darkBackground, 0.95),
      },
      code: {
        // ui
        bg: `#1b191f`, // another meh
        bgInline: darkBorder,
        border: colorsTokens.grey[90],
        lineHighlightBackground: hex2rgba(colorsTokens.purple[90], 0.25),
        lineHighlightBorder: colorsTokens.purple[90],
        scrollbarThumb: colorsTokens.grey[70],
        scrollbarTrack: colorsTokens.grey[90],
        copyButton: colorsTokens.grey[40],
        // tokens
        add: colorsTokens.green[50],
        comment: colorsTokens.grey[30],
        cssString: colorsTokens.orange[50],
        invisibles: `#e0d7d1`,
        keyword: colorsTokens.magenta[30],
        punctuation: colorsTokens.whiteFade[70],
        regex: `#d88489`,
        remove: colorsTokens.red[40],
        selector: colorsTokens.orange[30],
        tag: colorsTokens.teal[60],
        text: colorsTokens.grey[30],
      },
      link: {
        border: colorsTokens.purple[90],
        color: colorsTokens.purple[40],
        hoverBorder: colorsTokens.purple[70],
        hoverColor: colorsTokens.purple[30],
      },
      navigation: {
        background: hex2rgba(darkBackground, 0.975),
        linkActive: colorsTokens.purple[40],
        linkDefault: colorsTokens.whiteFade[60],
        linkHover: colorsTokens.white,
        socialLink: colorsTokens.grey[50],
      },
      themedInput: {
        background: darkBorder,
        backgroundFocus: `black`,
        focusBorder: colorsTokens.purple[60],
        focusBoxShadow: colorsTokens.purple[60],
        icon: colorsTokens.grey[50],
        iconFocus: colorsTokens.purple[50],
        placeholder: colorsTokens.whiteFade[50],
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
        activeSectionBackground: hex2rgba(colorsTokens.purple[90], 0.2),
        itemBorderActive: colorsTokens.purple[80],
        itemBorderColor: `transparent`,
        itemHoverBackground: hex2rgba(colorsTokens.purple[90], 0.2),
      },
      ui: {
        background: darkBackground,
        hover: colorsTokens.purple[90],
        border: darkBorder,
      },
      widget: {
        background: darkBackground,
        border: darkBorder,
        color: colorsTokens.white,
      },
      highlightedBox: {
        background: colorsTokens.grey[90],
        color: colorsTokens.white,
      },
      newsletter: {
        background: darkBackground,
        border: darkBorder,
        heading: colorsTokens.white,
        stripeColorA: colorsTokens.red[90],
        stripeColorB: colorsTokens.blue[90],
      },
      search: {
        suggestionHighlightBackground: colorsTokens.gatsby,
        suggestionHighlightColor: colorsTokens.purple[20],
      },
      button: {
        secondaryBg: `transparent`,
        secondaryText: colorsTokens.purple[40],
        secondaryBorder: colorsTokens.purple[40],
      },
      pullquote: {
        color: colorsTokens.purple[10],
        borderColor: colorsTokens.purple[90],
      },
    },
  },
}

// sizes
const s = {
  headerHeight: spaceTokens[11],
  bannerHeight: spaceTokens[8],
  logo: spaceTokens[6],
  pluginsSidebarWidthDefault: `21rem`,
  pluginsSidebarWidthLarge: `24rem`,
  showcaseSidebarMaxWidth: `15rem`,
  sidebarItemMinHeight: spaceTokens[8],
  sidebarUtilityHeight: spaceTokens[10],
  pageHeadingDesktopWidth: spaceTokens[10],
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
  avatar: spaceTokens[7],
}

const zIndices = {
  widget: 2,
  navigation: 5,
  banner: 10,
  modal: 10,
  sidebar: 10,
  floatingActionButton: 20,
  skipLink: 100,
}

const newTheme = {
  ...defaultTheme,
  initialColorMode: `light`,
  useColorSchemeMediaQuery: true,
  colors: c,
  sizes: s,
  zIndices: zIndices,
  buttons: {
    large: {
      fontSize: 4,
      px: 4,
      height: `52px`,
    },
    small: {
      fontSize: 2,
      py: 2,
      px: 3,
    },
  },
  links: {
    muted: {
      fontSize: 1,
      lineHeight: `solid`,
      py: 3,
      "&&": {
        border: 0,
        color: `textMuted`,
        display: `flex`,
        fontWeight: `body`,
      },
      "&&:hover": {
        color: `link.hoverColor`,
      },
    },
  },
}

export {
  borders,
  breakpoints,
  fonts,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  mediaQueries,
  radii,
  shadows,
  space,
  transition,
} from "./theme"

// individual exports
// colors extended with theme-ui required values
export { c as colors, s as sizes, zIndices }

export const theme = newTheme
