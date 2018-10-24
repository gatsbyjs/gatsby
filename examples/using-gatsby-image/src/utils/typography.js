import Typography from "typography"
import elkGlenTheme from "typography-theme-elk-glen"
delete elkGlenTheme.googleFonts
elkGlenTheme.baseFontSize = `16px`
elkGlenTheme.baseLineHeight = 1.5
elkGlenTheme.blockMarginBottom = 0.75
elkGlenTheme.headerColor = `#000`
elkGlenTheme.bodyColor = `#26222a`
elkGlenTheme.scaleRatio = 1.5
elkGlenTheme.accentColor = `#639`
elkGlenTheme.monospaceFontFamily = [
  `SFMono-Regular`,
  `Menlo`,
  `Monaco`,
  `Consolas`,
  `Liberation Mono`,
  `Courier New`,
  `monospace`,
]
elkGlenTheme.bodyFontFamily = [
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
  `Arial`,
  `sans-serif`,
]
elkGlenTheme.headerFontFamily = elkGlenTheme.bodyFontFamily
//[`Larsseit`]

elkGlenTheme.overrideThemeStyles = ({ rhythm, scale }, options) => {
  return {
    "h1, h2, h3, h4, h5, h6": {
      letterSpacing: `-.0125em`,
      fontWeight: `700`,
    },
    h1: {
      ...scale(1),
      color: `#00f !important`,
      marginTop: `0 !important`,
      lineHeight: 1,
    },
    a: {
      textShadow: `none`,
      color: `#639`,
      fontWeight: `bold`,
      transition: `.2s ease-out`,
      // fontFamily: `Larsseit !important`,
      backgroundImage: `linear-gradient(to top, #e6d9f2, #e6d9f2 1px, rgba(0, 0, 0, 0) 2px)`,
    },
    "a:hover": {
      backgroundColor: `#e6d9f2`,
    },
    ".list-success": {
      marginLeft: 0,
      listStyle: `none`,
    },
    ".list-success li": {
      paddingLeft: `1.5em !important`,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='#639' d='M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z' /%3E%3C/svg%3E")`,
      backgroundRepeat: `no-repeat`,
      backgroundSize: `1em`,
      backgroundPosition: `0 .25em`,
    },
  }
}

const typography = new Typography(elkGlenTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

// Back out the below once Typography is upgraded for es6
export default typography

export const options = typography.options
export const scale = typography.scale
export const rhythm = typography.rhythm
