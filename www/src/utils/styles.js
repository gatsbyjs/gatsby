import hex2rgba from "hex2rgba"
import { css } from "glamor"

import presets, { colors } from "./presets"
import { rhythm, scale, options } from "./typography"

const stripeAnimation = css.keyframes({
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
    ":after": {
      content: ``,
      display: `block`,
    },
    "& svg": {
      marginLeft: `.2em`,
    },
    [presets.Tablet]: {
      ...scale(1 / 5),
      padding: `${rhythm(2 / 6)} ${rhythm(3 / 5)}`,
    },
    [presets.VHd]: {
      padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
    },
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
    [presets.VHd]: {
      padding: `${rhythm(1 / 2)} ${rhythm(1)}`,
    },
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
}
