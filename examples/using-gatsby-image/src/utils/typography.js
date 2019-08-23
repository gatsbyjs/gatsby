import Typography from "typography"

import { colors, animation } from "./presets"

const bodyFontFamily = [
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

const _options = {
  bodyFontFamily,
  baseLineHeight: 1.5,
  blockMarginBottom: 0.75,
  headerColor: `#000`,
  headerWeight: 700,
  boldWeight: 700,
  bodyColor: `#26222a`,
  scaleRatio: 1.25,
  accentColor: colors.gatsby,
  monospaceFontFamily: [
    `SFMono-Regular`,
    `Menlo`,
    `Monaco`,
    `Consolas`,
    `Liberation Mono`,
    `Courier New`,
    `monospace`,
  ],
  headerFontFamily: bodyFontFamily,
  overrideStyles: ({ rhythm }, options) => {
    return {
      "h1, h2, h3, h4, h5, h6": {
        letterSpacing: `-.0125em`,
        marginTop: rhythm(2),
      },
      a: {
        backgroundImage: `linear-gradient(to top, ${colors.ui.bright}, ${colors.ui.bright} 1px, rgba(0, 0, 0, 0) 2px)`,
        color: colors.gatsby,
        fontWeight: `bold`,
        textDecoration: `none`,
        transition: `${animation.speedDefault} ${animation.curveDefault}`,
      },
      "a:hover": {
        backgroundColor: colors.ui.light,
      },
      code: {
        fontSize: `100%`,
        fontFamily: options.monospaceFontFamily.join(`,`),
      },
    }
  },
}

const typography = new Typography(_options)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

// Back out the below once Typography is upgraded for es6
export const { scale, rhythm, options } = typography
export default typography
