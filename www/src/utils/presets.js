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
  // layout
  headerHeight: `3.75rem`,
  bannerHeight: `2.5rem`,
  sidebarUtilityHeight: `2.5rem`,
  pageHeadingDesktopWidth: `3.5rem`,
  sidebar: {
    width: {
      default: 12,
      large: 12,
    },
  },
  transition: {
    curve: {
      default: `cubic-bezier(0.4, 0, 0.2, 1)`,
    },
    speed: {
      default: `250ms`,
      fast: `100ms`,
      slow: `350ms`,
    },
  },
  radii: [0, 2, 4, 8, 16, 9999, `100%`],
  shadows: {
    card: `0 3px 10px rgba(25, 17, 34, 0.075)`,
    cardHover: `0 10px 42px rgba(25, 17, 34, 0.1)`,
    cardActive: `0 3px 10px rgba(25, 17, 34, 0.05)`,
  },
  lineHeights: {
    solid: 1,
    dense: 1.25,
    default: 1.5,
    loose: 1.75,
  },
  space: [0, 1 / 6, 1 / 3, 1 / 2, 2 / 3, 5 / 6, 1, 4 / 3, 5 / 3, 2],
  scale: [
    `0.75rem`,
    `0.875rem`,
    `1rem`,
    `1.125rem`,
    `1.25rem`,
    `1.5rem`,
    `1.75rem`,
    `2rem`,
    `2.25rem`,
    `2.625rem`,
  ],
  letterSpacings: {
    normal: `normal`,
    tracked: `0.075em`,
    tight: `-0.015em`,
    mega: `0.25em`,
  },
}
