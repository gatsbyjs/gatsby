const colors = require(`./colors`).default

module.exports = {
  colors,
  mq: {
    mobile: `@media (min-width: 400px)`,
    phablet: `@media (min-width: 550px)`,
    tablet: `@media (min-width: 750px)`,
    desktop: `@media (min-width: 1000px)`,
    xl: `@media (min-width: 1200px)`,
    xxl: `@media (min-width: 1600px)`,
  },
  animation: {
    curveDefault: `cubic-bezier(0.4, 0, 0.2, 1)`,
    curveExpo: `cubic-bezier(.17, .67, .83, .67)`,
    speedDefault: `200ms`,
    speedFast: `100ms`,
    speedSlow: `350ms`,
  },
  elevation: {
    raised: 10,
    overlay: 20,
  },
  gutter: {
    default: `1.25rem`,
    tablet: `2.5rem`,
    desktop: `3.75rem`,
  },
  offset: `45vw`,
  offsetXxl: `45rem`,
}
