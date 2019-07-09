const primary = `rebeccapurple`
const blue = `#3c58e8`

export default {
  initialColorMode: `light`,
  colors: {
    primary,
    secondary: `#444`,
    text: `#000`,
    heading: `#000`,
    background: `#fff`,
    link: blue,
    muted: `#888`,
    highlight: `tomato`,
    blue,
  },
  fonts: {
    body: `system-ui, sans-serif`,
  },
  lineHeights: {
    body: 1.5,
  },
  styles: {
    root: {
      fontFamily: `body`,
      lineHeight: `body`,
    },
    a: {
      color: blue,
      "&:hover": {
        color: `secondary`,
      },
    },
    img: {
      maxWidth: `100%`,
    },
    pre: {
      text: primary,
      background: `#f6f3f9`,
      overflowX: `scroll`,
      p: 2,
    },
    code: {
      text: primary,
      background: `#f6f3f9`,
    },
  },
}
