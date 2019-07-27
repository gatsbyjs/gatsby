import { keyframes } from "@emotion/core"

import {
  colors,
  space,
  transition,
  radii,
  mediaQueries,
  fontSizes,
  fontWeights,
  letterSpacings,
  lineHeights,
  fonts,
  zIndices,
} from "../gatsby-plugin-theme-ui"

const stripeAnimation = keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `${space[7]} ${space[11]}` },
})

export const focusStyle = {
  outline: 0,
  boxShadow: `0 0 0 ${space[1]} ${colors.input.focusBoxShadow}`,
}

export const srOnly = {
  position: `absolute`,
  width: 1,
  height: 1,
  padding: 0,
  overflow: `hidden`,
  clip: `rect(0,0,0,0)`,
  whiteSpace: `nowrap`,
  border: 0,
}

export const searchInputStyles = {
  appearance: `none`,
  bg: `navigation.searchBackground`,
  border: 0,
  borderRadius: 2,
  color: `text.primary`,
  fontSize: 3,
  p: 1,
  pr: 3,
  pl: 7,
  overflow: `hidden`,
  width: `100%`,
  ":focus": {
    bg: `navigation.searchBackgroundFocus`,
    color: `text.primary`,
    outline: 0,
    width: `100%`,
  },
  "::placeholder": {
    color: `navigation.searchPlaceholder`,
  },

  fontFamily: `header`,
  transition: t =>
    `width ${t.transition.speed.default} ${
      t.transition.curve.default
    }, background-color ${t.transition.speed.default} ${
      t.transition.curve.default
    }`,
}

export const buttonStyles = {
  default: {
    alignItems: `center`,
    backgroundColor: `gatsby`,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: `solid`,
    borderColor: `gatsby`,
    color: `white`,
    cursor: `pointer`,
    display: `inline-flex`,
    fontFamily: `header`,
    fontWeight: `bold`,
    flexShrink: 0,
    lineHeight: `dense`,
    textDecoration: `none`,
    WebkitFontSmoothing: `antialiased`,
    whiteSpace: `nowrap`,
    padding: `${space[2]} ${space[3]}`,
    backgroundSize: `${space[7]} ${space[7]}`,
    transition: `all ${transition.speed.default} ${transition.curve.default}`,
    ":hover, :focus": {
      backgroundColor: colors.gatsby,
      backgroundImage: `linear-gradient(135deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
      color: colors.white,
      animation: `${stripeAnimation} 2.8s linear infinite`,
      borderColor: colors.gatsby,
    },
    ":focus": {
      ...focusStyle,
    },
    ":after": { content: `''`, display: `block` },
    "& svg": { marginLeft: `.2em` },
  },
  secondary: {
    backgroundColor: `transparent`,
    color: colors.gatsby,
    fontWeight: `normal`,
  },
  large: {
    fontSize: fontSizes[4],
    padding: `${space[3]} ${space[4]}`,
  },
  small: {
    fontSize: fontSizes[1],
    padding: `${space[2]} ${space[3]}`,
    [mediaQueries.md]: {
      fontSize: fontSizes[2],
    },
  },
  tiny: {
    borderRadius: radii[1],
    fontSize: fontSizes[1],
    padding: `${space[1]} ${space[2]}`,
    [mediaQueries.md]: {
      fontSize: fontSizes[2],
    },
  },
  ondark: {
    border: `1px solid ${colors.purple[10]}`,
    background: colors.purple[80],
  },
}

export const svgStyles = {
  stroke: {
    "& .svg-stroke": {
      strokeMiterlimit: 10,
      strokeWidth: 1.4173,
    },
  },
  default: {
    "& .svg-stroke-accent": { stroke: colors.purple[40] },
    "& .svg-stroke-lilac": { stroke: colors.purple[40] },
    "& .svg-fill-lilac": { fill: colors.purple[40] },
    "& .svg-fill-gatsby": { fill: colors.purple[40] },
    "& .svg-fill-brightest": { fill: colors.white },
    "& .svg-fill-accent": { fill: colors.purple[40] },
    "& .svg-stroke-gatsby": { stroke: colors.purple[40] },
    "& .svg-fill-gradient-accent-white-top": { fill: `transparent` },
    "& .svg-fill-gradient-accent-white-45deg": { fill: `transparent` },
    "& .svg-fill-gradient-accent-white-bottom": { fill: colors.white },
    "& .svg-fill-gradient-purple": { fill: colors.purple[40] },
    "& .svg-stroke-gradient-purple": { stroke: colors.purple[40] },
    "& .svg-fill-lavender": { fill: `transparent` },
  },
  active: {
    "& .svg-stroke-accent": { stroke: colors.accent },
    "& .svg-stroke-lilac": { stroke: colors.lilac },
    "& .svg-stroke-gatsby": { stroke: colors.gatsby },
    "& .svg-stroke-gradient-purple": { stroke: `url(#purple-top)` },
    "& .svg-fill-lilac": { fill: colors.lilac },
    "& .svg-fill-gatsby": { fill: colors.gatsby },
    "& .svg-fill-accent": { fill: colors.accent },
    "& .svg-fill-lavender": { fill: colors.lavender },
    "& .svg-fill-brightest": { fill: colors.white },
    "& .svg-fill-gradient-accent-white-45deg": {
      fill: `url(#accent-white-45deg)`,
    },
    "& .svg-fill-gradient-purple": { fill: `url(#lilac-gatsby)` },
    "& .svg-fill-gradient-accent-white-bottom": {
      fill: `url(#accent-white-bottom)`,
    },
    "& .svg-fill-gradient-accent-white-top": {
      fill: `url(#accent-white-top)`,
    },
  },
}

// This is an exceptionally bad name
export const linkStyles = {
  fontSize: fontSizes[1],
  lineHeight: lineHeights.solid,
  padding: `${space[3]} 0`,
  "&&": {
    border: 0,
    color: colors.text.secondary,
    display: `flex`,
    fontWeight: `normal`,
  },
  "&&:hover": {
    color: colors.gatsby,
  },
}

export const formInput = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.input.border}`,
  borderRadius: radii[2],
  padding: space[2],
  fontFamily: fonts.system,
  fontSize: fontSizes[2],
  verticalAlign: `middle`,
  transition: `all ${transition.speed.default} ${transition.curve.default}`,
  "::placeholder": {
    color: colors.text.placeholder,
    opacity: 1,
  },
}

export const formInputFocus = {
  borderColor: colors.input.focusBorder,
  ...focusStyle,
}

export const pullIntoGutter = {
  marginLeft: `-${space[6]}`,
  marginRight: `-${space[6]}`,
  paddingLeft: space[6],
  paddingRight: space[6],
}

export const skipLink = {
  border: 0,
  color: colors.gatsby,
  clip: `rect(0 0 0 0)`,
  height: 1,
  width: 1,
  margin: -1,
  padding: 0,
  overflow: `hidden`,
  position: `absolute`,
  zIndex: zIndices.skipLink,
  fontSize: fontSizes[1],
  ":focus": {
    padding: space[4],
    position: `fixed`,
    top: space[6],
    left: space[6],
    background: colors.white,
    textDecoration: `none`,
    width: `auto`,
    height: `auto`,
    clip: `auto`,
  },
}

export const breakpointGutter = `@media (min-width: 42rem)`

const prismToken = {
  // PrismJS syntax highlighting token styles
  // https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/
  ".token": {
    display: `inline`,
  },
  ".token.comment, .token.block-comment, .token.prolog, .token.doctype, .token.cdata": {
    color: colors.code.comment,
  },
  ".token.punctuation": {
    color: colors.code.punctuation,
  },
  ".token.property, .token.tag, .token.boolean, .token.number, .token.function-name, .token.constant, .token.symbol": {
    color: colors.code.tag,
  },
  ".token.selector, .token.attr-name, .token.string, .token.char, .token.function, .token.builtin": {
    color: colors.code.selector,
  },
  ".token.operator, .token.entity, .token.url, .token.variable": {},
  ".token.atrule, .token.attr-value, .token.keyword, .token.class-name": {
    color: colors.code.keyword,
  },
  ".token.inserted": {
    color: colors.code.add,
  },
  ".token.deleted": {
    color: colors.code.remove,
  },
  ".token.regex, .token.important": {
    color: colors.code.regex,
  },
  ".language-css .token.string, .style .token.string": {
    color: colors.code.cssString,
  },
  ".token.important": {
    fontWeight: fontWeights[0],
  },
  ".token.bold": {
    fontWeight: fontWeights[1],
  },
  ".token.italic": {
    fontStyle: `italic`,
  },
  ".token.entity": {
    cursor: `help`,
  },
  ".namespace": {
    opacity: 0.7,
  },
  // PrismJS plugin styles
  ".token.tab:not(:empty):before, .token.cr:before, .token.lf:before": {
    color: colors.code.invisibles,
  },
}

const gatsbyHighlightLanguageBadges = {
  ".gatsby-highlight pre[class*='language-']": {
    backgroundColor: `transparent`,
    border: 0,
    padding: `${space[6]} 0`,
    WebkitOverflowScrolling: `touch`,
  },
  ".gatsby-highlight pre[class*='language-']::before": {
    background: `#ddd`,
    borderRadius: `0 0 ${radii[2]}px ${radii[2]}px`,
    color: colors.text.header,
    fontSize: fontSizes[0],
    fontFamily: fonts.monospace,
    letterSpacing: letterSpacings.tracked,
    lineHeight: lineHeights.solid,
    padding: `${space[1]} ${space[2]}`,
    position: `absolute`,
    left: space[6],
    textAlign: `right`,
    textTransform: `uppercase`,
    top: `0`,
  },
  ".gatsby-highlight pre[class='language-javascript']::before": {
    content: `'js'`,
    background: `#f7df1e`,
  },
  ".gatsby-highlight pre[class='language-js']::before": {
    content: `'js'`,
    background: `#f7df1e`,
  },
  ".gatsby-highlight pre[class='language-jsx']::before": {
    content: `'jsx'`,
    background: `#61dafb`,
  },
  ".gatsby-highlight pre[class='language-graphql']::before": {
    content: `'GraphQL'`,
    background: `#E10098`,
    color: colors.white,
  },
  ".gatsby-highlight pre[class='language-html']::before": {
    content: `'html'`,
    background: `#005A9C`,
    color: colors.white,
  },
  ".gatsby-highlight pre[class='language-css']::before": {
    content: `'css'`,
    background: `#ff9800`,
    color: colors.white,
  },
  ".gatsby-highlight pre[class='language-mdx']::before": {
    content: `'mdx'`,
    background: `#f9ac00`,
    color: colors.white,
    fontWeight: `400`,
  },
  ".gatsby-highlight pre[class='language-shell']::before": {
    content: `'shell'`,
  },
  ".gatsby-highlight pre[class='language-sh']::before": {
    content: `'sh'`,
  },
  ".gatsby-highlight pre[class='language-bash']::before": {
    content: `'bash'`,
  },
  ".gatsby-highlight pre[class='language-yaml']::before": {
    content: `'yaml'`,
    background: `#ffa8df`,
  },
  ".gatsby-highlight pre[class='language-markdown']::before": {
    content: `'md'`,
  },
  ".gatsby-highlight pre[class='language-json']::before, .gatsby-highlight pre[class='language-json5']::before": {
    content: `'json'`,
    background: `linen`,
  },
  ".gatsby-highlight pre[class='language-diff']::before": {
    content: `'diff'`,
    background: `#e6ffed`,
  },
  ".gatsby-highlight pre[class='language-text']::before": {
    content: `'text'`,
    background: colors.white,
  },
  ".gatsby-highlight pre[class='language-flow']::before": {
    content: `'flow'`,
    background: `#E8BD36`,
  },
}

const gatsbyHighlight = {
  // gatsby-remark-prismjs styles
  ".gatsby-highlight": {
    background: colors.code.bg,
    color: colors.text.primary,
    position: `relative`,
    WebkitOverflowScrolling: `touch`,
  },
  ".gatsby-highlight pre code": {
    display: `block`,
    fontSize: `100%`,
    lineHeight: 1.5,
    float: `left`,
    minWidth: `100%`,
    // reset code vertical padding declared earlier
    padding: `0 ${space[6]}`,
  },
  ".gatsby-highlight-code-line": {
    background: colors.code.border,
    marginLeft: `-${space[6]}`,
    marginRight: `-${space[6]}`,
    paddingLeft: space[5],
    paddingRight: space[6],
    borderLeft: `${space[1]} solid ${colors.code.lineHighlightBorder}`,
    display: `block`,
  },
  ".gatsby-highlight pre::-webkit-scrollbar": {
    width: space[2],
    height: space[2],
  },
  ".gatsby-highlight pre::-webkit-scrollbar-thumb": {
    background: colors.code.scrollbarThumb,
  },
  ".gatsby-highlight pre::-webkit-scrollbar-track": {
    background: colors.code.border,
  },
}

export const global = {
  ...prismToken,
  ...gatsbyHighlight,
  ...gatsbyHighlightLanguageBadges,
  html: {
    backgroundColor: colors.white,
    WebkitFontSmoothing: `antialiased`,
    MozOsxFontSmoothing: `grayscale`,
  },
  a: {
    textDecoration: `none`,
  },
  h1: {
    fontWeight: fontWeights[2],
  },
  "h1, h2, h3, h4, h5, h6": {
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    marginTop: space[9],
  },
  h3: {
    marginTop: space[9],
  },
  "h4, h5, h6": { fontSize: fontSizes[3] },
  "h5, h6": { fontWeight: fontWeights[0] },
  h6: { fontSize: fontSizes[2] },
  blockquote: {
    paddingLeft: space[6],
    marginLeft: 0,
    borderLeft: `${space[1]} solid ${colors.ui.border.subtle}`,
  },
  hr: {
    backgroundColor: colors.ui.border.subtle,
  },
  iframe: {
    border: 0,
  },
  "th, td": {
    borderColor: colors.ui.border.subtle,
  },
  "tt, code, kbd, samp": {
    // reset line-height set by
    // https://github.com/KyleAMathews/typography.js/blob/3c99e905414d19cda124a7baabeb7a99295fec79/packages/typography/src/utils/createStyles.js#L198
    lineHeight: `inherit`,
  },
  "h1 code, h2 code, h3 code, h4 code, h5 code, h6 code": {
    fontWeight: fontWeights[0],
    fontSize: `82.5%`,
  },
  "tt, code, kbd": {
    background: colors.code.bgInline,
    paddingTop: `0.2em`,
    paddingBottom: `0.2em`,
  },
  "tt, code, kbd, .gatsby-code-title": {
    fontFamily: fonts.monospace,
    fontSize: `90%`,
    // Disable ligatures as they look funny as code.
    fontVariant: `none`,
    WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
    fontFeatureSettings: `"clig" 0, "calt" 0`,
  },
  // Target image captions.
  // This is kind of a fragile selector...
  ".gatsby-resp-image-link + em, .gatsby-resp-image-wrapper + em": {
    fontSize: fontSizes[1],
    lineHeight: lineHeights.dense,
    paddingTop: space[2],
    marginBottom: space[9],
    display: `block`,
    fontStyle: `normal`,
    color: colors.text.secondary,
    position: `relative`,
  },
  ".gatsby-resp-image-link + em a, .gatsby-resp-image-wrapper + em a": {
    fontWeight: fontWeights[0],
    color: colors.lilac,
  },
  ".main-body a": {
    color: colors.link.color,
    textDecoration: `none`,
    transition: `all ${transition.speed.fast} ${transition.curve.default}`,
    borderBottom: `1px solid ${colors.link.border}`,
  },
  ".main-body a:hover": {
    borderBottomColor: colors.link.hoverBorder,
  },
  ".post-body h1": {
    fontWeight: fontWeights[1],
  },
  ".post-body figure img": {
    marginBottom: 0,
  },
  ".post-body figcaption": {
    color: colors.text.secondary,
    fontSize: `87.5%`,
    marginTop: space[1],
    marginBottom: space[3],
  },
  //
  ".main-body a.anchor": {
    color: `inherit`,
    fill: colors.link.color,
    textDecoration: `none`,
    borderBottom: `none`,
  },
  ".main-body a.anchor:hover": {
    background: `none`,
  },
  // gatsby-image
  ".main-body a.gatsby-resp-image-link": {
    borderBottom: `transparent`,
    marginTop: space[9],
    marginBottom: space[9],
  },
  ".main-body figure a.gatsby-resp-image-link": {
    borderBottom: `transparent`,
    marginTop: space[9],
    marginBottom: 0,
  },
  ".gatsby-highlight, .gatsby-code-title, .post-body .gatsby-resp-image-link": {
    marginLeft: `-${space[6]}`,
    marginRight: `-${space[6]}`,
  },
  ".gatsby-resp-image-link": {
    borderRadius: `${radii[1]}px`,
    overflow: `hidden`,
  },
  // gatsby-remark-code-titles styles
  // https://www.gatsbyjs.org/packages/gatsby-remark-code-titles/
  ".gatsby-code-title": {
    background: colors.code.bg,
    borderBottom: `1px solid ${colors.code.border}`,
    color: colors.code.text,
    padding: `${space[5]} ${space[6]} ${space[4]}`,
    fontSize: fontSizes[0],
  },
  video: {
    width: `100%`,
    marginBottom: space[6],
  },
  ".twitter-tweet-rendered": {
    margin: `${space[9]} auto !important`,
  },
  ".egghead-video": {
    border: `none`,
  },
  // Fancy external links in posts, borrowed from
  // https://github.com/comfusion/after-dark/
  // @see https://github.com/comfusion/after-dark/blob/8fdbe2f480ac40315cf0e01cece785d2b5c4b0c3/layouts/partials/critical-theme.css#L36-L39
  ".gatsby-resp-image-link + em a[href*='//']:after": {
    content: `" " url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20class='i-external'%20viewBox='0%200%2032%2032'%20width='14'%20height='14'%20fill='none'%20stroke='%23744C9E'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='9.38%'%3E%3Cpath%20d='M14%209%20L3%209%203%2029%2023%2029%2023%2018%20M18%204%20L28%204%2028%2014%20M28%204%20L14%2018'/%3E%3C/svg%3E")`,
  },
  [mediaQueries.md]: {
    ".gatsby-highlight, .gatsby-resp-image-link, .gatsby-code-title": {
      marginLeft: 0,
      marginRight: 0,
      borderRadius: `${radii[2]}px`,
    },
    ".gatsby-code-title": {
      borderRadius: `${radii[2]}px ${radii[2]}px 0 0`,
    },
    ".gatsby-code-title + .gatsby-highlight": {
      borderRadius: `0 0 ${radii[2]}px ${radii[2]}px`,
    },
  },
  [mediaQueries.lg]: {
    ".gatsby-highlight, .post-body .gatsby-resp-image-link, .gatsby-code-title": {
      marginLeft: `-${space[6]}`,
      marginRight: `-${space[6]}`,
    },
  },
}
