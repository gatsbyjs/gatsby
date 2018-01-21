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
  maxWidth: 35,
  maxWidthWithSidebar: 26,
  calm: `rgba(38, 32, 44, .5)`,
  // palette by @SachaG
  // @see https://www.figma.com/file/J6IYJEtdRmwJQOrcZ2DfvxDD/Gatsby
  // brand replaced with #663399 rebeccapurple
  B700: `#663399`, // brand
  B600: ``,
  B500: `#9D7CBF`, // brandLight
  B400: ``,
  B300: `#e0d6eb`, // lightPurple
  B200: `#F5F3F7`, // brandLighter
  B100: ``, // veryLightPurple, was #f6f2f8, replaced by B200
  B50: `#fbfafc`, // sidebar
  // bolder palette by @ArchieHicklin
  // @see https://github.com/gatsbyjs/gatsby/issues/1173#issuecomment-309415650
  accent: `#ffb238`, // "Mustard"
  radius: 2,
  radiusLg: 4,
  gutters: {
    default: 1.25,
    HdR: 2.5,
    VHdR: 3,
    VVHdR: 4.5,
  },
  shadowKeyUmbraOpacity: 0.1,
  shadowKeyPenumbraOpacity: 0.07,
  shadowAmbientShadowOpacity: 0.06,
  shadowColor: `157, 124, 191`,
  animation: {
    curveDefault: `cubic-bezier(0.4, 0, 0.2, 1)`,
    speedDefault: `250ms`,
    speedFast: `100ms`,
  },
  logoOffset: 1.7,
  headerHeight: `3.5rem`,
}
