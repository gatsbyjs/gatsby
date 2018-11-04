const colors = require(`./colors`).default

module.exports = {
  colors,
  Mobile: `@media (min-width: 400px)`,
  Phablet: `@media (min-width: 550px)`,
  Tablet: `@media (min-width: 750px)`,
  Desktop: `@media (min-width: 1000px)`,
  Xl: `@media (min-width: 1200px)`,
  Xxl: `@media (min-width: 1600px)`,
  animation: {
    curveDefault: `cubic-bezier(0.4, 0, 0.2, 1)`,
    curveExpo: `cubic-bezier(.17, .67, .83, .67)`,
    speedDefault: `200ms`,
    speedFast: `100ms`,
    speedSlow: `350ms`,
  },
  zIndex: {
    raised: 10,
    overlay: 20,
  },
  gutter: {
    default: `20px`,
    tablet: `40px`,
    desktop: `60px`,
  },
  offset: `45vw`,
  offsetXxl: `720px`,
}
