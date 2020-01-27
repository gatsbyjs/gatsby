import { mediaQueries } from "../../gatsby-plugin-theme-ui"

const prismToken = t => {
  return {
    // PrismJS syntax highlighting token styles
    // https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/
    ".token": {
      display: `inline`,
    },
    ".token.comment, .token.block-comment, .token.prolog, .token.doctype, .token.cdata": {
      color: t.colors.code.comment,
    },
    ".token.property, .token.tag, .token.boolean, .token.number, .token.function-name, .token.constant, .token.symbol": {
      color: t.colors.code.tag,
    },
    ".token.punctuation": {
      color: t.colors.code.punctuation,
    },
    ".token.selector, .token.attr-name, .token.string, .token.char, .token.function, .token.builtin": {
      color: t.colors.code.selector,
    },
    ".token.operator, .token.entity, .token.url, .token.variable": {},
    ".token.atrule, .token.attr-value, .token.keyword, .token.class-name": {
      color: t.colors.code.keyword,
    },
    ".token.inserted": {
      color: t.colors.code.add,
    },
    ".token.deleted": {
      color: t.colors.code.remove,
    },
    ".token.regex, .token.important": {
      color: t.colors.code.regex,
    },
    ".language-css .token.string, .style .token.string": {
      color: t.colors.code.cssString,
    },
    ".token.important": {
      fontWeight: t.fontWeights.body,
    },
    ".token.bold": {
      fontWeight: t.fontWeights.bold,
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
      color: t.colors.code.invisibles,
    },
  }
}

const gatsbyHighlightLanguageBadges = t => {
  return {
    ".gatsby-highlight pre[class*='language-']": {
      backgroundColor: `transparent`,
      border: 0,
      padding: `${t.space[6]} 0`,
      WebkitOverflowScrolling: `touch`,
    },
    ".gatsby-highlight pre[class*='language-']::before": {
      background: t.colors.grey[30],
      borderRadius: `0 0 ${t.radii[2]}px ${t.radii[2]}px`,
      color: t.colors.grey[90],
      fontSize: t.fontSizes[0],
      fontFamily: t.fonts.monospace,
      letterSpacing: t.letterSpacings.tracked,
      lineHeight: t.lineHeights.solid,
      padding: `${t.space[1]} ${t.space[2]}`,
      position: `absolute`,
      left: t.space[6],
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
    ".gatsby-highlight pre[class='language-typescript']::before": {
      content: `'ts'`,
      background: `#294e80`,
    },
    ".gatsby-highlight pre[class='language-ts']::before": {
      content: `'ts'`,
      background: `#294e80`,
    },
    ".gatsby-highlight pre[class='language-tsx']::before": {
      content: `'tsx'`,
      background: `#294e80`,
    },
    ".gatsby-highlight pre[class='language-graphql']::before": {
      content: `'GraphQL'`,
      background: `#E10098`,
      color: t.colors.white,
    },
    ".gatsby-highlight pre[class='language-html']::before": {
      content: `'html'`,
      background: `#005A9C`,
      color: t.colors.white,
    },
    ".gatsby-highlight pre[class='language-css']::before": {
      content: `'css'`,
      background: `#ff9800`,
      color: t.colors.white,
    },
    ".gatsby-highlight pre[class='language-mdx']::before": {
      content: `'mdx'`,
      background: `#f9ac00`,
      color: t.colors.white,
      fontWeight: t.fontWeights.body,
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
      background: t.colors.white,
    },
    ".gatsby-highlight pre[class='language-flow']::before": {
      content: `'flow'`,
      background: `#E8BD36`,
    },
  }
}

const gatsbyHighlight = t => {
  return {
    // gatsby-remark-prismjs styles
    ".gatsby-highlight": {
      background: t.colors.code.background,
      color: t.colors.text,
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
      padding: `0 ${t.space[6]}`,
    },
    ".gatsby-highlight-code-line": {
      background: t.colors.code.lineHighlightBackground,
      marginLeft: `-${t.space[6]}`,
      marginRight: `-${t.space[6]}`,
      paddingLeft: t.space[5],
      paddingRight: t.space[6],
      borderLeft: `${t.space[1]} solid ${t.colors.code.lineHighlightBorder}`,
      display: `block`,
    },
    ".gatsby-highlight pre::-webkit-scrollbar": {
      width: t.space[2],
      height: t.space[2],
    },
    ".gatsby-highlight pre::-webkit-scrollbar-thumb": {
      background: t.colors.code.scrollbarThumb,
    },
    ".gatsby-highlight pre::-webkit-scrollbar-track": {
      background: t.colors.code.scrollbarTrack,
    },
  }
}

export const globalStyles = t => {
  return {
    ...prismToken(t),
    ...gatsbyHighlight(t),
    ...gatsbyHighlightLanguageBadges(t),
    "html, body": {
      color: t.colors.text,
      MozOsxFontSmoothing: `grayscale`,
      textRendering: `optimizelegibility`,
      WebkitFontSmoothing: `antialiased`,
    },
    a: {
      textDecoration: `none`,
    },
    h1: {
      fontWeight: t.fontWeights.headingPrimary,
    },
    "h1, h2, h3, h4, h5, h6": {
      color: t.colors.heading,
      letterSpacing: t.letterSpacings.tight,
    },
    h2: {
      marginTop: t.space[9],
    },
    h3: {
      marginTop: t.space[9],
    },
    "h4, h5, h6": { fontSize: t.fontSizes[3] },
    "h5, h6": { fontWeight: t.fontWeights.body },
    h6: { fontSize: t.fontSizes[2] },
    blockquote: {
      paddingLeft: t.space[6],
      marginLeft: 0,
      borderLeft: `${t.space[1]} solid ${t.colors.ui.border}`,
    },
    hr: {
      backgroundColor: t.colors.ui.border,
    },
    iframe: {
      border: 0,
    },
    "th, td": {
      borderColor: t.colors.ui.border,
    },
    "tt, code, kbd, samp": {
      // reset line-height set by
      // https://github.com/KyleAMathews/typography.js/blob/3c99e905414d19cda124a7baabeb7a99295fec79/packages/typography/src/utils/createStyles.js#L198
      lineHeight: `inherit`,
    },
    "h1 code, h2 code, h3 code, h4 code, h5 code, h6 code": {
      fontWeight: t.fontWeights.body,
      fontSize: `82.5%`,
    },
    "tt, code, kbd": {
      background: t.colors.code.backgroundInline,
      paddingTop: `0.2em`,
      paddingBottom: `0.2em`,
    },
    "tt, code, kbd, .gatsby-code-title": {
      fontFamily: t.fonts.monospace,
      fontSize: `90%`,
      // Disable ligatures as they look funny as code.
      fontVariant: `none`,
      WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
      fontFeatureSettings: `"clig" 0, "calt" 0`,
    },
    // Target image captions.
    // This is kind of a fragile selector...
    ".gatsby-resp-image-link + em, .gatsby-resp-image-wrapper + em": {
      fontSize: t.fontSizes[1],
      lineHeight: t.lineHeights.dense,
      paddingTop: t.space[2],
      marginBottom: t.space[9],
      display: `block`,
      fontStyle: `normal`,
      color: t.colors.textMuted,
      position: `relative`,
    },
    ".gatsby-resp-image-link + em a, .gatsby-resp-image-wrapper + em a": {
      fontWeight: t.fontWeights.body,
      color: t.colors.lilac,
    },
    ".main-body a": {
      color: t.colors.link.color,
      textDecoration: `none`,
      transition: `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
      borderBottom: `1px solid ${t.colors.link.border}`,
    },
    ".main-body a:hover": {
      borderBottomColor: t.colors.link.hoverBorder,
    },
    ".post-body h1": {
      fontWeight: t.fontWeights.bold,
    },
    ".post-body figure img": {
      marginBottom: 0,
    },
    ".post-body figcaption": {
      color: t.colors.textMuted,
      fontSize: `87.5%`,
      marginTop: t.space[1],
      marginBottom: t.space[3],
    },
    //
    ".main-body a.anchor": {
      color: `inherit`,
      fill: t.colors.link.color,
      textDecoration: `none`,
      borderBottom: `none`,
    },
    ".main-body a.anchor:hover": {
      background: `none`,
    },
    // gatsby-image
    ".main-body a.gatsby-resp-image-link": {
      borderBottom: `transparent`,
      marginTop: t.space[9],
      marginBottom: t.space[9],
    },
    ".main-body figure a.gatsby-resp-image-link": {
      borderBottom: `transparent`,
      marginTop: t.space[9],
      marginBottom: 0,
    },
    ".gatsby-highlight, .gatsby-code-title, .post-body .gatsby-resp-image-link": {
      marginLeft: `-${t.space[6]}`,
      marginRight: `-${t.space[6]}`,
    },
    ".gatsby-resp-image-link": {
      borderRadius: `${t.radii[1]}px`,
      overflow: `hidden`,
    },
    // gatsby-remark-code-titles styles
    // https://www.gatsbyjs.org/packages/gatsby-remark-code-titles/
    ".gatsby-code-title": {
      background: t.colors.code.background,
      borderBottom: `1px solid ${t.colors.code.border}`,
      color: t.colors.code.text,
      padding: `${t.space[5]} ${t.space[6]} ${t.space[4]}`,
      fontSize: t.fontSizes[0],
      marginTop: t.space[2],
    },
    video: {
      width: `100%`,
      marginBottom: t.space[6],
    },
    ".twitter-tweet-rendered": {
      margin: `${t.space[9]} auto !important`,
    },
    ".egghead-video": {
      border: `none`,
      maxWidth: `100%`,
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
        borderRadius: `${t.radii[2]}px`,
      },
      ".gatsby-code-title": {
        borderRadius: `${t.radii[2]}px ${t.radii[2]}px 0 0`,
      },
      ".gatsby-code-title + .gatsby-highlight": {
        borderRadius: `0 0 ${t.radii[2]}px ${t.radii[2]}px`,
      },
    },
  }
}
