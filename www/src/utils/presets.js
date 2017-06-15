import colors from "./colors"

module.exports = {
  mobile: `(min-width: 400px)`,
  Mobile: `@media (min-width: 400px)`,
  phablet: `(min-width: 550px)`,
  Phablet: `@media (min-width: 550px)`,
  tablet: `(min-width: 750px)`,
  Tablet: `@media (min-width: 750px)`,
  desktop: `(min-width: 1000px)`,
  Desktop: `@media (min-width: 1000px)`,
  hd: `(min-width: 1200px)`,
  Hd: `@media (min-width: 1200px)`,
  maxWidth: 36,
  maxWidthWithSidebar: 26,
  purple: colors.a[13],
  lightPurple: colors.b[2],
  veryLightPurple: colors.b[0],
  sidebarStyles: {
    borderRight: `1px solid ${colors.b[0]}`,
    backgroundColor: `#fcfaff`,
    position: `fixed`,
    overflowY: `auto`,
    height: `calc(100vh - 55px)`,
  },
}
