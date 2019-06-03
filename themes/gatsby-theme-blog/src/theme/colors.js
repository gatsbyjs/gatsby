const teal = `#66b9bf`
const darkTeal = `#078092`
const darkBlue = `#282c35`
const darkGray = `#222`
const almostBlack = `#1a1a1a`
const white = `#fff`
const lightWhite = `rgba(255, 255, 255, 0.88)`
const opaqueLightYellow = `rgba(255, 229, 100, 0.2)`
const opaqueLightWhite = `hsla(0, 0%, 100%, 0.2)`
const lightGray = `hsla(0, 0%, 0%, 0.2)`
const slateBlue = `hsl(222, 14%, 25%)`

export default {
  text: darkGray,
  background: white,
  primary: darkTeal,
  secondary: almostBlack,
  muted: lightGray,
  highlight: opaqueLightYellow,
  heading: darkGray,
  prism: {
    background: `#011627`,
    comment: `#809393`,
    string: `#addb67`,
    var: `#d6deeb`,
    number: `#f78c6c`,
    constant: `#82aaff`,
    punctuation: `#c792ea`,
    className: `#ffc98b`,
    tag: `#ffa7c4`,
    boolean: `#ff5874`,
    property: `#80cbc4`,
    namespace: `#b2ccd6`,
    highlight: `hsla(207, 95%, 15%, 1)`,
  },
  modes: {
    dark: {
      text: lightWhite,
      background: darkBlue,
      primary: teal,
      secondary: lightWhite,
      muted: opaqueLightWhite,
      highlight: slateBlue,
      heading: white,
    },
  },
}
