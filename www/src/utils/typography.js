import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import presets, { colors } from "./presets"

const systemFontFamily = [
  `-apple-system`,
  `BlinkMacSystemFont`,
  `Segoe UI`,
  `Roboto`,
  `Helvetica Neue`,
  `Arial`,
  `Noto Sans`,
  `sans-serif`,
  `Apple Color Emoji`,
  `Segoe UI Emoji`,
  `Segoe UI Symbol`,
  `Noto Color Emoji`,
]
const headerFontFamily = [`Futura PT`, ...systemFontFamily]
const monospaceFontFamily = [
  `SFMono-Regular`,
  `Menlo`,
  `Monaco`,
  `Consolas`,
  `Liberation Mono`,
  `Courier New`,
  `monospace`,
]

const _options = {
  bodyFontFamily: systemFontFamily,
  headerFontFamily,
  monospaceFontFamily,
  systemFontFamily,
  baseLineHeight: presets.lineHeights.default,
  headerLineHeight: presets.lineHeights.dense,
  headerColor: colors.gray.dark,
  bodyColor: colors.gray.copy,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      a: {
        textDecoration: `none`,
      },
      "h1,h2,h4,h5,h6": {
        letterSpacing: `-0.0075em`,
      },
      h1: { color: `#000` },
      h2: {
        marginTop: rhythm(options.blockMarginBottom * 2),
      },
      h3: {
        marginTop: rhythm(options.blockMarginBottom * 2),
      },
      blockquote: {
        paddingLeft: rhythm(options.blockMarginBottom),
        marginLeft: 0,
        borderLeft: `${rhythm(options.blockMarginBottom / 4)} solid ${
          colors.ui.light
        }`,
      },
      hr: {
        backgroundColor: colors.ui.light,
      },
      "tt, code, kbd, samp": {
        // reset line-height set by
        // https://github.com/KyleAMathews/typography.js/blob/3c99e905414d19cda124a7baabeb7a99295fec79/packages/typography/src/utils/createStyles.js#L198
        lineHeight: `inherit`,
      },
      "h1 code, h2 code, h3 code, h4 code, h5 code, h6 code": {
        fontWeight: `normal`,
        fontSize: `82.5%`,
      },
      "tt, code, kbd": {
        background: colors.code.bgInline,
        paddingTop: `0.2em`,
        paddingBottom: `0.2em`,
      },
      "tt, code, kbd, .gatsby-code-title": {
        fontFamily: options.monospaceFontFamily.join(`,`),
        fontSize: `90%`,
        // Disable ligatures as they look funny as code.
        fontVariant: `none`,
        WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
        fontFeatureSettings: `"clig" 0, "calt" 0`,
      },
      // gatsby-remark-prismjs styles
      ".gatsby-highlight": {
        background: colors.code.bg,
        borderRadius: `${presets.radii[1]}px`,
        padding: rhythm(options.blockMarginBottom),
        marginBottom: rhythm(options.blockMarginBottom),
        overflow: `auto`,
        WebkitOverflowScrolling: `touch`,
        position: `relative`,
      },
      ".gatsby-highlight pre[class*='language-']": {
        padding: 0,
        marginTop: 0,
        marginBottom: 0,
        backgroundColor: `transparent`,
        border: 0,
        float: `left`,
        minWidth: `100%`,
        overflow: `initial`,
      },
      ".gatsby-highlight pre[class*='language-']::before": {
        position: `absolute`,
        top: `0`,
        right: `20px`,
        padding: `3px 10px`,
        fontSize: presets.scale[0],
        textAlign: `right`,
        color: colors.gray.dark,
        fontWeight: `700`,
        letterSpacing: `0.8px`,
        textTransform: `uppercase`,
        borderRadius: `0 0 ${presets.radii[2]}px ${presets.radii[2]}px`,
        background: `#ddd`,
        fontFamily: options.monospaceFontFamily.join(`,`),
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
        color: `#fff`,
        fontWeight: `400`,
      },
      ".gatsby-highlight pre[class='language-html']::before": {
        content: `'html'`,
        background: `#005A9C`,
        color: `#fff`,
        fontWeight: `400`,
      },
      ".gatsby-highlight pre[class='language-css']::before": {
        content: `'css'`,
        background: `#ff9800`,
        color: `#fff`,
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
        background: `#fff`,
      },
      ".gatsby-highlight pre[class='language-flow']::before": {
        content: `'flow'`,
        background: `#E8BD36`,
      },
      ".gatsby-highlight pre code": {
        display: `block`,
        fontSize: `100%`,
        // reset code vertical padding declared earlier
        padding: 0,
      },
      ".gatsby-highlight-code-line": {
        background: colors.code.border,
        marginRight: `${rhythm(-options.blockMarginBottom)}`,
        marginLeft: `${rhythm(-options.blockMarginBottom)}`,
        paddingRight: rhythm(options.blockMarginBottom),
        paddingLeft: `${rhythm((options.blockMarginBottom / 5) * 4)}`,
        borderLeft: `${rhythm((options.blockMarginBottom / 5) * 1)} solid ${
          colors.code.lineHighlightBorder
        }`,
        display: `block`,
      },
      ".gatsby-highlight::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      ".gatsby-highlight::-webkit-scrollbar-thumb": {
        background: colors.code.scrollbarThumb,
      },
      ".gatsby-highlight::-webkit-scrollbar-track": {
        background: colors.code.border,
        borderRadius: `0 0 ${presets.radii[2]}px ${presets.radii[2]}px`,
      },
      // Target image captions.
      // This is kind of a fragile selector...
      ".gatsby-resp-image-link + em, .gatsby-resp-image-wrapper + em": {
        fontSize: presets.scale[1],
        lineHeight: presets.lineHeights.dense,
        paddingTop: rhythm(3 / 8),
        marginBottom: rhythm(options.blockMarginBottom * 2),
        display: `block`,
        fontStyle: `normal`,
        color: colors.gray.calm,
        position: `relative`,
      },
      ".gatsby-resp-image-link + em a, .gatsby-resp-image-wrapper + em a": {
        fontWeight: `normal`,
        color: colors.lilac,
      },
      ".main-body a": {
        color: colors.lilac,
        textDecoration: `none`,
        transition: `all ${presets.animation.speedFast} ${
          presets.animation.curveDefault
        }`,
        borderBottom: `1px solid ${colors.lilac}`,
        fontWeight: `normal`,
      },
      ".main-body a:hover": {
        borderBottomColor: colors.ui.border,
      },
      ".post-body a": {
        color: `${colors.lilac}`,
        fontWeight: `normal`,
      },
      ".post-body figure img": {
        marginBottom: 0,
      },
      ".post-body figcaption": {
        color: colors.gray.calm,
        fontSize: `87.5%`,
        marginTop: rhythm(1 / 4),
        marginBottom: rhythm(2 / 4),
      },
      ".main-body a.anchor": {
        color: `inherit`,
        fill: colors.lilac,
        textDecoration: `none`,
        borderBottom: `none`,
        boxShadow: `none`,
      },
      ".main-body a.anchor:hover": {
        background: `none`,
      },
      ".main-body a.gatsby-resp-image-link": {
        boxShadow: `none`,
        borderBottom: `transparent`,
        marginTop: rhythm(options.blockMarginBottom * 2),
        marginBottom: rhythm(options.blockMarginBottom * 2),
      },
      ".main-body figure a.gatsby-resp-image-link": {
        boxShadow: `none`,
        borderBottom: `transparent`,
        marginTop: rhythm(options.blockMarginBottom * 2),
        marginBottom: 0,
      },
      ".main-body a.gatsby-resp-image-link:hover": {
        background: `none`,
        boxShadow: `none`,
      },
      ".gatsby-highlight, .post .gatsby-resp-image-link": {
        marginLeft: rhythm(-options.blockMarginBottom),
        marginRight: rhythm(-options.blockMarginBottom),
      },
      ".gatsby-resp-image-link": {
        borderRadius: `${presets.radii[1]}px`,
        overflow: `hidden`,
      },
      // gatsby-remark-code-titles styles
      // https://www.gatsbyjs.org/packages/gatsby-remark-code-titles/
      ".gatsby-code-title": {
        background: colors.code.bg,
        borderBottom: `1px solid ${colors.code.border}`,
        color: colors.code.text,
        marginLeft: rhythm(-options.blockMarginBottom),
        marginRight: rhythm(-options.blockMarginBottom),
        padding: `${rhythm(options.blockMarginBottom)} ${rhythm(
          options.blockMarginBottom
        )} ${rhythm(options.blockMarginBottom / 2)}`,
        fontSize: `74%`,
      },
      "@media (max-width:634px)": {
        ".gatsby-highlight, .gatsby-resp-image-link": {
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
        },
      },
      video: {
        width: `100%`,
        marginBottom: rhythm(options.blockMarginBottom),
      },
      ".twitter-tweet-rendered": {
        margin: `${rhythm(options.blockMarginBottom * 2)} auto !important`,
      },
      ".egghead-video": {
        border: `none`,
      },
      [presets.Lg]: {
        ".gatsby-highlight, .post .gatsby-resp-image-link, .gatsby-code-title": {
          marginLeft: rhythm(-options.blockMarginBottom * 1.5),
          marginRight: rhythm(-options.blockMarginBottom * 1.5),
        },
        ".gatsby-highlight": {
          padding: rhythm(options.blockMarginBottom * 1.5),
          marginBottom: rhythm(options.blockMarginBottom * 1.5),
        },
        ".gatsby-highlight-code-line": {
          marginRight: `${rhythm(-options.blockMarginBottom * 1.5)}`,
          marginLeft: `${rhythm(-options.blockMarginBottom * 1.5)}`,
          paddingRight: rhythm(options.blockMarginBottom * 1.5),
          paddingLeft: `${rhythm(((options.blockMarginBottom * 1.5) / 5) * 4)}`,
          borderLeftWidth: `${rhythm(
            ((options.blockMarginBottom * 1.5) / 5) * 1
          )}`,
        },
        ".gatsby-code-title": {
          padding: `${rhythm(options.blockMarginBottom)} ${rhythm(
            options.blockMarginBottom * 1.5
          )} ${rhythm(options.blockMarginBottom / 2)}`,
        },
      },
      [presets.Xxl]: {
        html: {
          fontSize: `${(18 / 16) * 100}%`,
        },
      },
      // PrismJS syntax highlighting token styles
      // https://www.gatsbyjs.org/packages/gatsby-remark-prismjs/
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
        fontWeight: `normal`,
      },
      ".token.bold": {
        fontWeight: `bold`,
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
    }
  },
}

const typography = new Typography(_options)

export const { scale, rhythm, options } = typography
export default typography
