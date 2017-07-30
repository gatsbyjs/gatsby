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
  VHd: `@media (min-width: 1450px)`,
  VVHd: `@media (min-width: 1650px)`,
  maxWidth: 36,
  maxWidthWithSidebar: 26,
  purple: colors.a[13],
  lightPurple: colors.b[2],
  veryLightPurple: colors.b[0],
  sidebar: `#fcfaff`,
  // palette by @SachaG
  // @see https://www.figma.com/file/J6IYJEtdRmwJQOrcZ2DfvxDD/Gatsby
  brand: `#744C9E`,
  brandLight: `#9D7CBF`,
  brandLighter: `#F5F3F7`,
  brandDark: `#744C9E`,
  // bolder palette by @ArchieHicklin
  // @see https://github.com/gatsbyjs/gatsby/issues/1173#issuecomment-309415650
  accent: `#ffb238`, // "Mustard"
  radius: 2,
  radiusLg: 4,
  gutters: {
    default: 1.5,
    HdR: 2.5,
    VHdR: 3.5,
    VVHdR: 4.5,
  },
  logoOffset: 1.7,
}
