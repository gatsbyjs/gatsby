const colors = require(`./colors`).default

module.exports = {
  colors,
  // breakpoints
  xs: `(min-width: 400px)`,
  Xs: `@media (min-width: 400px)`,
  sm: `(min-width: 550px)`,
  Sm: `@media (min-width: 550px)`,
  md: `(min-width: 750px)`,
  Md: `@media (min-width: 750px)`,
  lg: `(min-width: 1000px)`,
  Lg: `@media (min-width: 1000px)`,
  xl: `(min-width: 1200px)`,
  Xl: `@media (min-width: 1200px)`,
  xxl: `(min-width: 1600px)`,
  Xxl: `@media (min-width: 1600px)`,
  // layout stuff
  // main content container max-width
  maxWidth: 35,
  maxWidthWithSidebar: 26,
  gutters: {
    default: 1.25,
  },
  headerHeight: `3.75rem`,
  bannerHeight: `2.5rem`,
  sidebarUtilityHeight: `2.5rem`,
  pageHeadingDesktopWidth: `3.5rem`,
  shadowKeyUmbraOpacity: 0.1,
  shadowKeyPenumbraOpacity: 0.07,
  shadowAmbientShadowOpacity: 0.06,
  animation: {
    curveDefault: `cubic-bezier(0.4, 0, 0.2, 1)`,
    speedDefault: `250ms`,
    speedFast: `100ms`,
    speedSlow: `350ms`,
  },
  radii: [0, 2, 4, 8, 16, 9999, `100%`],
  boxShadows: {
    card: { boxShadow: `0 3px 10px rgba(25, 17, 34, 0.075)` },
    cardHover: { boxShadow: `0 10px 42px rgba(25, 17, 34, 0.1)` },
  },
  lineHeights: {
    solid: 1,
    dense: 1.25,
    default: 1.5,
    loose: 1.75,
  },
}
