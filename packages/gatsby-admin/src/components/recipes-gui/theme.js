import { getTheme } from "gatsby-interface"

const baseTheme = getTheme()

const theme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    background: `white`,
  },
  fontWeights: {
    ...baseTheme.fontWeights,
  },
  styles: {
    h1: {
      fontSize: 6,
      fontFamily: `heading`,
      fontWeight: `heading`,
      mt: 0,
      mb: 4,
    },
    h2: {
      fontSize: 5,
      fontFamily: `heading`,
      fontWeight: `heading`,
      mt: 0,
      mb: 4,
    },
    p: {
      color: baseTheme.tones.NEUTRAL.dark,
      fontSize: 2,
      fontFamily: `body`,
      fontWeight: `body`,
      mt: 0,
      mb: 4,
      lineHeight: 1.45,
    },
    pre: {
      fontFamily: baseTheme.fonts.monospace,
      fontSize: 0,
      lineHeight: 1.45,
      mt: 0,
      mb: 6,
      whiteSpace: `pre-wrap`,
    },
    inlineCode: {
      backgroundColor: `hsla(0,0%,0%,0.06)`,
      color: baseTheme.tones.NEUTRAL.darker,
      borderRadius: `3px`,
      py: `0.2em`,
      px: `0.2em`,
      fontSize: `90%`,
    },
    ol: {
      color: baseTheme.tones.NEUTRAL.dark,
      paddingLeft: 8,
      mt: 0,
      mb: 6,
      fontFamily: `body`,
      fontWeight: `body`,
    },
    ul: {
      color: baseTheme.tones.NEUTRAL.dark,
      paddingLeft: 8,
      mt: 0,
      mb: 6,
      fontFamily: `body`,
      fontWeight: `body`,
    },
    li: {
      color: baseTheme.tones.NEUTRAL.dark,
      mb: 2,
      fontFamily: `body`,
      fontWeight: `body`,
      lineHeight: 1.6,
    },
  },
}

export default theme
