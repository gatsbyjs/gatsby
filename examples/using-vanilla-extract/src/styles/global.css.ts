import { globalStyle } from "@vanilla-extract/css"

export const rootColors = {
  light: {
    bg: `white`,
    color: `black`,
  },
  dark: {
    bg: `#0B1222`,
    color: `#CBD5E1`
  }
}

globalStyle(`*`, {
  boxSizing: `border-box`,
  margin: 0,
})

globalStyle(`.dark`, {
  background: rootColors.dark.bg,
  color: rootColors.dark.color
})

globalStyle(`html`, {
  background: rootColors.light.bg,
  color: rootColors.light.color
})

globalStyle(`html, body`, {
  height: `100%`,
  fontSize: `18px`,
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
})

globalStyle(`body`, {
  lineHeight: 1.5,
  WebkitFontSmoothing: `antialiased`,
})

globalStyle(`img, picture, video, canvas, svg`, {
  display: `block`,
  maxWidth: `100%`,
})

globalStyle(`input, button, textare, select`, {
  font: `inherit`,
})

globalStyle(`p, h1, h2, h3, h4, h5, h6`, {
  overflowWrap: `break-word`,
})

globalStyle(`___gatsby`, {
  isolation: `isolate`,
})
