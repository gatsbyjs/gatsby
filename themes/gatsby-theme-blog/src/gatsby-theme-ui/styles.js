import prism from "./prism"

export default {
  root: {
    fontFamily: `body`,
  },
  pre: {
    fontFamily: `monospace`,
    tabSize: 4,
    hyphens: `none`,
    marginBottom: 0,
    color: `white`,
    bg: `none`,
    overflow: `auto`,
    p: 3,
    ...prism,
  },
  code: {
    fontFamily: `monospace`,
    // from typography overrideThemeStyles
    // "h1 code, h2 code, h3 code, h4 code, h5 code, h6 code"
    fontSize: `inherit`,
  },
  inlineCode: {
    borderRadius: `0.3em`,
    color: `secondary`,
    bg: `highlight`,
    paddingTop: `0.15em`,
    paddingBottom: `0.05em`,
    paddingX: `0.2em`,
  },
  div: {
    // .gatsby-highlight is rendered *outside* of the <pre> tag
    "&.gatsby-highlight": {
      mx: -3,
      mb: 3,
      borderRadius: [0, `10px`],
      bg: `prism.background`,
      WebkitOverflowScrolling: `touch`,
      overflow: `auto`,
    },
  },
  // from typography overrideThemeStyles
  a: {
    color: `primary`,
  },
  hr: {
    borderColor: `muted`,
  },
  p: {
    code: {
      fontSize: `inherit`,
    },
  },
  li: {
    code: {
      fontSize: `inherit`,
    },
  },
  blockquote: {
    color: `inherit`,
    borderLeftColor: `inherit`,
    opacity: 0.8,
    "&.translation": {
      fontSize: `1em`,
    },
  },
}
