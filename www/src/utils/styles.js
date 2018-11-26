import hex2rgba from "hex2rgba"
import { keyframes } from "react-emotion"

import presets, { colors } from "./presets"
import { rhythm, scale, options } from "./typography"

const stripeAnimation = keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `30px 60px` },
})

export const scrollbarStyles = {
  WebkitOverflowScrolling: `touch`,
  "&::-webkit-scrollbar": {
    width: `6px`,
    height: `6px`,
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
    borderRadius: presets.radius,
    borderWidth: 1,
    borderStyle: `solid`,
    borderColor: colors.gatsby,
    boxShadow: `none`,
    color: `#fff`,
    cursor: `pointer`,
    display: `inline-flex`,
    fontFamily: options.headerFontFamily.join(`,`),
    fontWeight: `bold`,
    flexShrink: 0,
    lineHeight: 1,
    WebkitFontSmoothing: `antialiased`,
    whiteSpace: `nowrap`,
    padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
    backgroundSize: `30px 30px`,
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
    ":hover, &:focus": {
      backgroundSize: `30px 30px`,
      backgroundColor: colors.gatsby,
      backgroundImage: `linear-gradient(45deg, rgba(0,0,0, 0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0, 0.1) 50%, rgba(0,0,0, 0.1) 75%, transparent 75%, transparent)`,
      color: `#fff`,
      animation: `${stripeAnimation} 2.8s linear infinite`,
    },
    ":focus": {
      outline: 0,
      boxShadow: `0 0 0 0.2rem ${hex2rgba(colors.lilac, 0.25)}`,
    },
    ":after": { content: `''`, display: `block` },
    "& svg": { marginLeft: `.2em` },
    [presets.Tablet]: {
      ...scale(1 / 5),
      padding: `${rhythm(2 / 6)} ${rhythm(3 / 5)}`,
    },
    [presets.VHd]: { padding: `${rhythm(1 / 2)} ${rhythm(1)}` },
  },
  secondary: {
    backgroundColor: `transparent`,
    color: colors.gatsby,
    fontWeight: `normal`,
  },
  large: {
    // borderRadius: presets.radiusLg,
    fontSize: scale(1 / 5).fontSize,
    padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
    [presets.Tablet]: {
      fontSize: scale(2 / 5).fontSize,
      padding: `${rhythm(2 / 4)} ${rhythm(3 / 5)}`,
    },
    [presets.VHd]: { padding: `${rhythm(1 / 2)} ${rhythm(1)}` },
  },
  small: {
    fontSize: scale(-1 / 3).fontSize,
    padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
    [presets.Tablet]: {
      fontSize: scale(-1 / 6).fontSize,
      padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
    },
    [presets.VHd]: {
      fontSize: scale(-1 / 6).fontSize,
      padding: `${rhythm(2 / 5)} ${rhythm(1 / 2)}`,
    },
  },
  tiny: {
    fontSize: scale(-1 / 3).fontSize,
    padding: `${rhythm(1 / 5)} ${rhythm(1 / 3)}`,
    [presets.Tablet]: {
      fontSize: scale(-1 / 4).fontSize,
      padding: `${rhythm(1 / 5)} ${rhythm(1 / 3)}`,
    },
    [presets.VHd]: {
      fontSize: scale(-1 / 5).fontSize,
      padding: `${rhythm(1 / 5)} ${rhythm(1 / 3)}`,
    },
  },
  ondark: { border: `1px solid ${colors.ui.light}` },
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
    "& .svg-fill-brightest": { fill: `#fff` },
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
