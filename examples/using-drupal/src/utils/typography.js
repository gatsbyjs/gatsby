import Typography from "typography"
import gray from "gray-percentage"
import {
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from "typography-breakpoint-constants"

const options = {
  baseFontSize: `18px`,
  baseLineHeight: 1.45,
  blockMarginBottom: 0.75,
  scaleRatio: 2.15,
  bodyColor: gray(36.5),
  bodyFontFamily: [`Josefin Sans`, `sans-serif`],
  headerFontFamily: [`Josefin Slab`, `serif`],
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      "h1,h2,h3,h4": {
        lineHeight: 1.2,
      },
      [TABLET_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 17px.
        html: {
          fontSize: `${17 / 16 * 100}%`,
        },
      },
      [MOBILE_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 16px.
        html: {
          fontSize: `${16 / 16 * 100}%`,
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

export default typography
