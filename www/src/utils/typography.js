import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import {
  space,
  fontSizes,
  colors,
  transition,
  radii,
  mediaQueries,
  lineHeights,
  letterSpacings,
  fontWeights,
} from "./presets"
// typography.js expects an array, so grab font stacks directly from tokens
import { fonts } from "gatsby-design-tokens"

const _options = {
  bodyFontFamily: fonts.system,
  headerFontFamily: fonts.header,
  baseLineHeight: lineHeights.default,
  headerLineHeight: lineHeights.dense,
  headerColor: colors.text.header,
  bodyColor: colors.text.primary,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm }) => {
    return {
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
        fontFamily: fonts.monospace.join(`,`),
        fontSize: `90%`,
        // Disable ligatures as they look funny as code.
        fontVariant: `none`,
        WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
        fontFeatureSettings: `"clig" 0, "calt" 0`,
      },
      // gatsby-remark-prismjs styles
      ".gatsby-highlight": {
        background: colors.code.bg,
        position: `relative`,
        WebkitOverflowScrolling: `touch`,
      },
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
        fontFamily: fonts.monospace.join(`,`),
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
      // Target image captions.
      // This is kind of a fragile selector...
      ".gatsby-resp-image-link + em, .gatsby-resp-image-wrapper + em": {
        fontSize: fontSizes[1],
        lineHeight: lineHeights.dense,
        paddingTop: rhythm(3 / 8),
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
        margin: `${space[2]} ${space[0]}`,
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
      // Fancy external links in posts, borrowed from
      // https://github.com/comfusion/after-dark/
      // @see https://github.com/comfusion/after-dark/blob/8fdbe2f480ac40315cf0e01cece785d2b5c4b0c3/layouts/partials/critical-theme.css#L36-L39
      ".gatsby-resp-image-link + em a[href*='//']:after": {
        content: `" " url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20class='i-external'%20viewBox='0%200%2032%2032'%20width='14'%20height='14'%20fill='none'%20stroke='%23744C9E'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='9.38%'%3E%3Cpath%20d='M14%209%20L3%209%203%2029%2023%2029%2023%2018%20M18%204%20L28%204%2028%2014%20M28%204%20L14%2018'/%3E%3C/svg%3E")`,
      },
      [mediaQueries.xxl]: {
        html: {
          fontSize: `${(18 / 16) * 100}%`,
        },
      },
    }
  },
}

const typography = new Typography(_options)

export const { scale, rhythm, options } = typography
export default typography
