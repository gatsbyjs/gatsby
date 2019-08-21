import Typography from "typography"
import {
  MOBILE_MEDIA_QUERY,
  TABLET_MEDIA_QUERY,
} from "typography-breakpoint-constants"

const theme = {
  baseFontSize: `18px`,
  baseLineHeight: 1.45,
  blockMarginBottom: 0.75,
  scaleRatio: 2.15,
  overrideStyles: ({ rhythm, scale }, options) => {
    return {
      "h1,h2,h3,h4": {
        lineHeight: 1.2,
      },
      [TABLET_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 17px.
        html: {
          fontSize: `${(17 / 16) * 100}%`,
        },
      },
      [MOBILE_MEDIA_QUERY]: {
        // Make baseFontSize on mobile 16px.
        html: {
          fontSize: `${(16 / 16) * 100}%`,
        },
      },
    }
  },
}

const typography = new Typography(theme)

// Back out the below once Typography is upgraded for es6
export default typography

export const rhythm = typography.rhythm
export const scale = typography.scale
export const options = typography.options
