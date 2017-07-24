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
  vPR: 1.5,
  vPHdR: 2.5,
  vPVHdR: 3.5,
  vPVVHdR: 4.5,
  logoWidth: 1.7,
  sidebar: `#fcfaff`,
  brand: `#744C9E`,
  heroMid: `#9D7CBF`,
  heroBright: `#F5F3F7`,
  heroBright: `#f9f5ff`,
  heroDark: `#744C9E`,
  radius: 3,
  radiusLg: 6,
  // heroDark: `#9D7CBF`,
  // bolder palette as per @ArchieHicklin
  // @see https://github.com/gatsbyjs/gatsby/issues/1173#issuecomment-309415650
  accent: `#ffb238`, // "Mustard"
  // brand: `#6653ff`, // Gatsby
  // hero colors based on "Gatsby", not yet from Archie's palette
  // heroBright: `#f5f5ff`,
  // heroMid: `#877DFC`,
  // heroDark: `#6653ff`,
}
