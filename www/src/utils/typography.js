import Typography from "typography"
import CodePlugin from "typography-plugin-code"
import presets from "./presets"
import colors from "./colors"
import {
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
  MIN_LARGER_DISPLAY_MEDIA_QUERY,
} from "typography-breakpoint-constants"

const options = {
  headerFontFamily: [`Futura PT`, `sans-serif`],
  bodyFontFamily: [`Spectral`, `Georgia`, `serif`],
  baseFontSize: `18px`,
  baseLineHeight: 1.45,
  // headerColor: `#44421f`,
  headerColor: colors.c[15],
  headerColor: `#26202c`,
  // bodyColor: `#44421f`,
  bodyColor: colors.c[14],
  bodyColor: `#3d3347`,
  blockMarginBottom: 0.8,
  scaleRatio: 2,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      "h1,h2,h4,h5,h6": {
        lineHeight: 1.075,
        marginTop: rhythm(1.5),
        marginBottom: rhythm(3 / 4),
        letterSpacing: `-0.0075em`,
      },
      ul: {
        marginTop: rhythm(1 / 2),
      },
      h1: {
        ...scale(4 / 5),
      },
      h3: {
        ...scale(2 / 5),
        lineHeight: 1,
        marginTop: rhythm(1),
        marginBottom: rhythm(1 / 2),
      },
      h4: {
        ...scale(1 / 5),
      },
      h5: {
        ...scale(0),
      },
      blockquote: {
        paddingLeft: rhythm(3 / 8),
        marginLeft: rhythm(3 / 8),
        borderLeft: `${rhythm(2 / 8)} solid ${presets.brandDark}`,
      },
      "tt,code": {
        // background: `hsla(23, 60%, 97%, 1)`,
        background: colors.a[0],
        fontFamily: `"Space Mono",Consolas,"Roboto Mono","Droid Sans Mono","Liberation Mono",Menlo,Courier,monospace`,
        fontSize: `80%`,
        // Disable ligatures as they look funny w/ Space Mono as code.
        fontVariant: `none`,
        WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
        fontFeatureSettings: `"clig" 0, "calt" 0`,
        paddingTop: `0.1em`,
        paddingBottom: `0.1em`,
      },
      ".gatsby-highlight": {
        background: colors.a[0],
        boxShadow: `inset 0 0 0 1px ${colors.a[1]}`,
        borderRadius: `${presets.radius}px`,
        padding: rhythm(3 / 4),
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
      ".gatsby-highlight pre code": {
        display: `block`,
        fontSize: `90%`,
        lineHeight: options.baseLineHeight,
      },
      ".gatsby-highlight-code-line": {
        background: colors.a[1],
        marginRight: `${rhythm(-3 / 4)}`,
        marginLeft: `${rhythm(-3 / 4)}`,
        paddingRight: rhythm(3 / 4),
        paddingLeft: `${rhythm(3 / 4 / 4 * 3)}`,
        borderLeft: `${rhythm(3 / 4 / 4 * 1)} solid ${colors.a[5]}`,
        display: `block`,
      },
      ".gatsby-highlight::-webkit-scrollbar": {
        width: `6px`,
        height: `6px`,
      },
      ".gatsby-highlight::-webkit-scrollbar-thumb": {
        background: colors.a[2],
      },
      ".gatsby-highlight::-webkit-scrollbar-track": {
        background: colors.a[1],
      },
      // Target image captions. This is kind of a fragile selector...
      "a.gatsby-resp-image-link + em": {
        ...scale(-1 / 5),
        lineHeight: 1.3,
        paddingTop: rhythm(3 / 8),
        marginBottom: rhythm(1),
        display: `block`,
        textAlign: `center`,
        fontStyle: `normal`,
        color: `rgb(62, 87, 121)`,
        color: `rgba(38, 32, 44,.62)`,
        position: `relative`,
      },
      "a.gatsby-resp-image-link + em a": {
        fontWeight: `normal`,
        fontFamily: options.headerFontFamily.join(`,`),
        color: presets.brand,
      },
      ".main-body a": {
        color: `inherit`,
        textDecoration: `none`,
        transition: `background ${presets.animation.speedDefault} ${presets
          .animation.curveDefault}`,
        borderBottom: `1px solid ${presets.lightPurple}`,
        boxShadow: `inset 0 -2px 0px 0px ${presets.lightPurple}`,
      },
      ".post-body a": {
        fontFamily: options.headerFontFamily.join(`,`),
        fontWeight: `bold`,
        fontSize: `102%`,
      },
      ".main-body a:hover": {
        background: presets.lightPurple,
      },
      ".main-body a.anchor": {
        color: `inherit`,
        fill: presets.brand,
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
      },
      ".main-body a.gatsby-resp-image-link:hover": {
        background: `none`,
        boxShadow: `none`,
      },
      ".post .gatsby-highlight, .post .gatsby-resp-iframe-wrapper, .post .gatsby-resp-image-link": {
        marginLeft: rhythm(-3 / 4), // 3/4 rhythm is amount of padding on mobile.
        marginRight: rhythm(-3 / 4),
      },
      ".gatsby-resp-image-link": {
        borderRadius: `${presets.radius}px`,
        overflow: `hidden`,
      },
      "@media (max-width:628px)": {
        ".post-body .gatsby-highlight, .gatsby-resp-image-link": {
          borderRadius: 0,
          borderLeft: 0,
          borderRight: 0,
        },
        ".post-body .gatsby-highlight": {
          boxShadow: `inset 0 1px 0 0 ${colors.a[1]}, inset 0 -1px 0 0 ${colors
            .a[1]}`,
        },
      },
      video: {
        width: `100%`,
        marginBottom: rhythm(options.blockMarginBottom),
      },
      ".twitter-tweet-rendered": {
        margin: `${rhythm(options.blockMarginBottom * 2)} auto !important`,
      },
      [MOBILE_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 16px.
        html: {
          fontSize: `${16 / 16 * 100}%`,
        },
      },
      [TABLET_MEDIA_QUERY]: {
        html: {
          fontSize: `${17 / 16 * 100}%`,
        },
      },
      [MIN_LARGER_DISPLAY_MEDIA_QUERY]: {
        html: {
          fontSize: `${21 / 16 * 100}%`,
        },
      },
      ".token.comment,.token.block-comment,.token.prolog,.token.doctype,.token.cdata": {
        // color: `#52ad9f`,
        color: colors.c[8],
      },
      ".token.punctuation": {
        // color: `#5F6364`,
        // color: `blue`,
        color: colors.c[12],
      },
      ".token.property,.token.tag,.token.boolean,.token.number,.token.function-name,.token.constant,.token.symbol,.token.deleted": {
        // color: `#a285d8`,
        color: colors.b[9],
      },
      ".token.selector,.token.attr-name,.token.string,.token.char,.token.function,.token.builtin,.token.inserted": {
        // color: `#a2466c`,
        color: colors.a[9],
      },
      ".token.operator, .token.entity, .token.url, .token.variable": {
        // color: `#c18b99`,
        // color: `blue`,
      },
      ".token.atrule, .token.attr-value, .token.keyword, .token.class-name": {
        // color: `#a285d8`,
        // color: `blue`,
        color: colors.b[8],
      },
      // Fancy external links in posts, borrowed from
      // https://github.com/comfusion/after-dark/
      // @see https://github.com/comfusion/after-dark/blob/8fdbe2f480ac40315cf0e01cece785d2b5c4b0c3/layouts/partials/critical-theme.css#L36-L39
      ".post-body a.gatsby-resp-image-link + em a[href*='//']:after": {
        content: `" " url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20class='i-external'%20viewBox='0%200%2032%2032'%20width='14'%20height='14'%20fill='none'%20stroke='%23744C9E'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='9.38%'%3E%3Cpath%20d='M14%209%20L3%209%203%2029%2023%2029%2023%2018%20M18%204%20L28%204%2028%2014%20M28%204%20L14%2018'/%3E%3C/svg%3E")`,
      },
    }
  },
}

const typography = new Typography(options)

export default typography
