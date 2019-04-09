import hex2rgba from "hex2rgba"
import { keyframes } from "@emotion/core"

import {
  colors,
  space,
  transition,
  radii,
  breakpoints,
  fontSizes,
  lineHeights,
  fonts,
} from "./presets"

const stripeAnimation = keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `${space[7]} ${space[11]}` },
})

export const srOnly = {
  position: `absolute`,
  width: 1,
  height: 1,
  padding: 0,
  overflow: `hidden`,
  clip: `rect(0,0,0,0)`,
  whiteSpace: `nowrap`,
  border: 0,
}

export const scrollbarStyles = {
  WebkitOverflowScrolling: `touch`,
  "&::-webkit-scrollbar": {
    width: space[2],
    height: space[2],
  },
  "&::-webkit-scrollbar-thumb": {
    background: colors.ui.bright,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: colors.lilac,
  },
  "&::-webkit-scrollbar-track": {
    background: colors.ui.light,
  },
}

export const buttonStyles = {
  default: {
    alignItems: `center`,
    backgroundColor: colors.gatsby,
    borderRadius: radii[1],
    borderWidth: 1,
    borderStyle: `solid`,
    borderColor: colors.gatsby,
    color: colors.white,
    cursor: `pointer`,
    display: `inline-flex`,
    fontFamily: fonts.header,
    fontWeight: `bold`,
    flexShrink: 0,
    lineHeight: lineHeights.dense,
    textDecoration: `none`,
    WebkitFontSmoothing: `antialiased`,
    whiteSpace: `nowrap`,
    padding: `${space[2]} ${space[3]}`,
    backgroundSize: `${space[7]} ${space[7]}`,
    transition: `all ${transition.speed.default} ${transition.curve.default}`,
    ":hover, :focus": {
      backgroundColor: colors.gatsby,
      backgroundImage: `linear-gradient(135deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
      color: colors.white,
      animation: `${stripeAnimation} 2.8s linear infinite`,
      borderColor: colors.gatsby,
    },
    ":focus": {
      outline: 0,
      boxShadow: `0 0 0 ${space[1]} ${hex2rgba(colors.lilac, 0.25)}`,
    },
    ":after": { content: `''`, display: `block` },
    "& svg": { marginLeft: `.2em` },
  },
  secondary: {
    backgroundColor: `transparent`,
    color: colors.gatsby,
    fontWeight: `normal`,
  },
  large: {
    fontSize: fontSizes[4],
    padding: `${space[3]} ${space[4]}`,
  },
  small: {
    fontSize: fontSizes[1],
    padding: `${space[2]} ${space[3]}`,
    [breakpoints.md]: {
      fontSize: fontSizes[2],
    },
  },
  tiny: {
    fontSize: fontSizes[1],
    padding: `${space[1]} ${space[2]}`,
    [breakpoints.md]: {
      fontSize: fontSizes[2],
    },
  },
  ondark: {
    border: `1px solid ${colors.ui.light}`,
    background: colors.gatsbyDark,
  },
}

export const svgStyles = {
  active: {
    "& .svg-stroke": {
      strokeWidth: 1.4173,
      strokeMiterlimit: 10,
    },
    "& .svg-stroke-accent": { stroke: colors.accent },
    "& .svg-stroke-lilac": { stroke: colors.lilac },
    "& .svg-stroke-gatsby": { stroke: colors.gatsby },
    "& .svg-stroke-gradient-purple": { stroke: `url(#purple-top)` },
    "& .svg-fill-lilac": { fill: colors.lilac },
    "& .svg-fill-gatsby": { fill: colors.gatsby },
    "& .svg-fill-accent": { fill: colors.accent },
    "& .svg-fill-wisteria": { fill: colors.wisteria },
    "& .svg-fill-brightest": { fill: colors.white },
    "& .svg-fill-gradient-accent-white-45deg": {
      fill: `url(#accent-white-45deg)`,
    },
    "& .svg-fill-gradient-purple": { fill: `url(#lilac-gatsby)` },
    "& .svg-fill-gradient-accent-white-bottom": {
      fill: `url(#accent-white-bottom)`,
    },
    "& .svg-fill-gradient-accent-white-top": {
      fill: `url(#accent-white-top)`,
    },
  },
}

// This is an exceptionally bad name
export const linkStyles = {
  fontSize: fontSizes[1],
  lineHeight: lineHeights.solid,
  padding: `${space[3]} 0`,
  "&&": {
    border: 0,
    color: colors.gray.calm,
    display: `flex`,
    fontWeight: `normal`,
  },
  "&&:hover": {
    color: colors.gatsby,
  },
}

export const formInput = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.ui.bright}`,
  borderRadius: radii[1],
  color: colors.brand,
  padding: space[2],
  fontSize: fontSizes[2],
  verticalAlign: `middle`,
  transition: `all ${transition.speed.default} ${transition.curve.default}`,
  "::placeholder": {
    color: colors.lilac,
    opacity: 1,
  },
}

export const skipLink = {
  border: 0,
  color: colors.gatsby,
  clip: `rect(0 0 0 0)`,
  height: 1,
  width: 1,
  margin: -1,
  padding: 0,
  overflow: `hidden`,
  position: `absolute`,
  zIndex: 100,
  fontSize: fontSizes[1],
  ":focus": {
    padding: space[4],
    position: `fixed`,
    top: space[6],
    left: space[6],
    background: colors.white,
    textDecoration: `none`,
    width: `auto`,
    height: `auto`,
    clip: `auto`,
  },
}
