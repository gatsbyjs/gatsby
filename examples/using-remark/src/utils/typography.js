import Typography from "typography"
import { baseHsl, colors } from "../styles/colors"
import presets from "../utils/presets"

const linkRaw = colors.link.substr(1)
const linkHoverRaw = colors.linkHover.substr(1)

const options = {
  baseFontSize: `17px`,
  baseLineHeight: 1.6,
  headerColor: `${colors.black}`,
  bodyColor: `${colors.text}`,
  blockMarginBottom: 0.75,
  headerWeight: 800,
  headerFontFamily: [
    `Spectral`,
    `-apple-system`,
    `BlinkMacSystemFont`,
    `Segoe UI`,
    `Roboto`,
    `Oxygen`,
    `Ubuntu`,
    `Cantarell`,
    `Fira Sans`,
    `Droid Sans`,
    `Helvetica Neue`,
    `sans-serif`,
  ],
  bodyFontFamily: [
    `Spectral`,
    `-apple-system`,
    `BlinkMacSystemFont`,
    `Segoe UI`,
    `Roboto`,
    `Oxygen`,
    `Ubuntu`,
    `Cantarell`,
    `Fira Sans`,
    `Droid Sans`,
    `Helvetica Neue`,
    `sans-serif`,
  ],
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      a: {
        borderColor: `${colors.link}`,
        color: `${colors.link}`,
        textDecoration: `none`,
      },
      blockquote: {
        borderLeft: `${rhythm(1 / 4)} solid hsla(${baseHsl},0.1)`,
        color: `hsla(${baseHsl},0.8)`,
        fontStyle: `italic`,
        marginLeft: 0,
        marginRight: rhythm(1),
        marginTop: rhythm(1),
        marginBottom: rhythm(1),
        paddingLeft: rhythm(2 / 4),
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      hr: {
        background: `${colors.smoke}`,
        height: `2px`,
      },
      // style gatsby-remark-responsive-image images
      ".gatsby-resp-image-link": {
        boxShadow: `none`,
        marginLeft: rhythm(-3 / 4), // 3/4 rhythm is amount of padding on mobile.
        marginRight: rhythm(-3 / 4),
      },
      "@media only screen and (min-width:38rem)": {
        ".gatsby-resp-image-link": {
          borderRadius: `.15rem`,
          overflow: `hidden`,
        },
      },
      ".post > .gatsby-highlight, .gatsby-resp-iframe-wrapper": {
        marginLeft: rhythm(-3 / 4), // 3/4 rhythm is amount of padding on mobile.
        marginRight: rhythm(-3 / 4),
      },
      ".gatsby-resp-image-link:hover": {
        background: `none`,
        boxShadow: `none`,
      },
      // fake image captions
      ".post .gatsby-resp-image-link + em": {
        ...scale(0 / 5),
        fontFamily: `Spectral, serif`,
        lineHeight: 1.4,
        display: `block`,
        textAlign: `right`,
        marginTop: rhythm(2 / 4),
        color: `${colors.light}`,
      },
      // code highlighting
      "tt,code": {
        fontFamily: `"Space Mono",Consolas,"Roboto Mono","Droid Sans Mono","Liberation Mono",Menlo,Courier,monospace`,
        // Disable ligatures as they look funny w/ Space Mono as code.
        fontVariant: `none`,
        WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
        fontFeatureSettings: `"clig" 0, "calt" 0`,
        paddingTop: `0.1em`,
        paddingBottom: `0.1em`,
        backgroundColor: `#fef9ec`,
        borderRadius: `2px`,
      },
      ".gatsby-highlight": {
        backgroundColor: `#fef9ec`,
        borderRadius: `.15rem`,
        marginTop: `0`,
        marginBottom: rhythm(3 / 4),
        padding: rhythm(3 / 4),
        overflow: `auto`,
      },
      ".gatsby-highlight pre[class*='language-']": {
        backgroundColor: `transparent`,
        borderRadius: 0,
        margin: 0,
        padding: 0,
        overflow: `initial`,
        float: `left`,
        minWidth: `100%`,
        textShadow: `none`,
      },
      ".gatsby-highlight-code-line": {
        background: `#fff2cc`,
        display: `block`,
        marginRight: rhythm(-3 / 4),
        marginLeft: rhythm(-3 / 4),
        paddingRight: rhythm(3 / 4),
        paddingLeft: rhythm(2 / 4),
        borderLeft: `${rhythm(1 / 4)} solid #ffd9b3`,
      },
      // fancy links
      ".post a:not(.gatsby-resp-image-link), .link-underline": {
        position: `relative`,
        backgroundImage: `linear-gradient(${colors.link},${colors.link})`,
        textShadow: `0.03em 0 ${colors.white}, -0.03em 0 ${colors.white}, 0 0.03em ${colors.white}, 0 -0.03em ${colors.white}, 0.06em 0 ${colors.white}, -0.06em 0 ${colors.white}, 0.09em 0 ${colors.white}, -0.09em 0 ${colors.white}, 0.12em 0 ${colors.white}, -0.12em 0 ${colors.white}, 0.15em 0 ${colors.white}, -0.15em 0 ${colors.white}`,
        transition: `all 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
        backgroundPosition: `0 98%`,
        backgroundRepeat: `repeat-x`,
        backgroundSize: `1px 1px`,
      },
      ".post a:not(.gatsby-resp-image-link):hover, .link-underline:hover": {
        color: `${colors.linkHover}`,
        backgroundImage: `linear-gradient(${colors.linkHover},${colors.linkHover})`,
      },
      ".post a.anchor": {
        textShadow: `0 !important`,
        backgroundImage: `0 !important`,
      },
      // fancy external links
      ".post a[href*='//']:after": {
        content: `" " url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20class='i-external'%20viewBox='0%200%2032%2032'%20width='14'%20height='14'%20fill='none'%20stroke='%23${linkRaw}'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='9.38%'%3E%3Cpath%20d='M14%209%20L3%209%203%2029%2023%2029%2023%2018%20M18%204%20L28%204%2028%2014%20M28%204%20L14%2018'/%3E%3C/svg%3E")`,
      },
      ".post a[href*='//']:hover:after": {
        content: `" " url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20class='i-external'%20viewBox='0%200%2032%2032'%20width='14'%20height='14'%20fill='none'%20stroke='%23${linkHoverRaw}'%20stroke-linecap='round'%20stroke-linejoin='round'%20stroke-width='9.38%'%3E%3Cpath%20d='M14%209%20L3%209%203%2029%2023%2029%2023%2018%20M18%204%20L28%204%2028%2014%20M28%204%20L14%2018'/%3E%3C/svg%3E")`,
      },
      // increase base font-size for phablet and desktop
      [presets.Phablet]: {
        html: {
          fontSize: `${18 / 16 * 100}%`,
        },
        h1: {
          ...scale(7 / 5),
        },
      },
      [presets.Desktop]: {
        html: {
          fontSize: `${20 / 16 * 100}%`,
        },
      },
    }
  },
}

const typography = new Typography(options)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

module.exports = typography
