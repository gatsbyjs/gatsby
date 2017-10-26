import Typography from "typography"
import elkGlenTheme from "typography-theme-elk-glen"
delete elkGlenTheme.googleFonts
elkGlenTheme.baseFontSize = `16px`
elkGlenTheme.baseLineHeight = 1.45
elkGlenTheme.blockMarginBottom = 0.75
elkGlenTheme.headerColor = `#253c28`
elkGlenTheme.bodyColor = `#304f35`
elkGlenTheme.accentColor = `#4c9e59`
elkGlenTheme.monospaceFontFamily = [
  `Space Mono`,
  `SFMono-Regular`,
  `Menlo`,
  `Monaco`,
  `Consolas`,
  `Liberation Mono`,
  `Courier New`,
  `monospace`,
]

elkGlenTheme.overrideThemeStyles = ({ rhythm, scale }, options) => {
  return {
    "h1, h2, h3, h4, h5, h6": {
      textTransform: `uppercase`,
      letterSpacing: `-.025em`,
    },
    h1: {
      ...scale(1),
      color: options.accentColor,
      marginTop: `0 !important`,
      lineHeight: 1,
    },
    "@media (min-width: 640px)": {
      html: {
        fontSize: `${21 / 17 * 100}%`,
      },
    },
  }
}

const typography = new Typography(elkGlenTheme)

export default typography
