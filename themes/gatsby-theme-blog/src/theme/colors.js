const gatsby = `#663399`
const gatsbyDarker = `#362066`
const gatsbyBright = `#D9BAE8`
const gray = `#48434F`
const darkGray = `#232129`
const almostBlack = `#1B1F23`
const white = `#fff`
const lightWhite = `rgba(255, 255, 255, 0.86)`
const opaqueLightYellow = `rgba(255, 229, 100, 0.2)`
const opaqueLightWhite = `hsla(0, 0%, 100%, 0.2)`
const lightGray = `hsla(0, 0%, 0%, 0.2)`

export default {
  text: darkGray,
  background: white,
  primary: gatsby,
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
      background: gatsbyDarker,
      primary: gatsbyBright,
      secondary: lightWhite,
      muted: opaqueLightWhite,
      highlight: gray,
      heading: white,
    },
  },
}
