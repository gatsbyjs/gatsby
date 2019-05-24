export default {
  root: {
    fontFamily: `body`,
  },
  Container: {
    maxWidth: 672,
  },
  pre: {
    // references styles from theme.prism (src/theme/prism.js)
    variant: `prism`,
    fontFamily: `monospace`,
    tabSize: 4,
    hyphens: `none`,
    marginBottom: 0,
    color: `white`,
    bg: `none`,
    overflow: `auto`,
    p: 3,
  },
  code: {
    fontFamily: `monospace`,
    // from typography overrideThemeStyles
    // "h1 code, h2 code, h3 code, h4 code, h5 code, h6 code"
    fontSize: `inherit`,
  },
  // todo: prism seems to break this
  inlineCode: {
    borderRadius: `0.3em`,
    color: `secondary`,
    bg: `highlight`,
    // paddingTop: `0.15em`,
    // paddingBottom: `0.05em`,
    paddingX: `0.2em`,
  },
  // .gatsby-highlight is rendered *outside* of the <pre> tag
  div: {
    "&.gatsby-highlight": {
      // todo: update spacing
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
    // "&.gatsby-resp-image-link": {
    //   boxShadow: `none`,
    // },
    // "&.anchor": {
    //   boxShadow: `none`,
    //   'svg[aria-hidden="true"]': {
    //     stroke: `primary`,
    //   },
    // },
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
