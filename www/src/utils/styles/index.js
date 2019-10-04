import { keyframes } from "@emotion/core"

import {
  colors,
  space,
  transition,
  radii,
  mediaQueries,
  fontSizes,
  fontWeights,
  lineHeights,
  fonts,
} from "../../gatsby-plugin-theme-ui"

const stripeAnimation = keyframes({
  "0%": { backgroundPosition: `0 0` },
  "100%": { backgroundPosition: `${space[7]} ${space[11]}` },
})

export const focusStyle = {
  outline: 0,
  boxShadow: `0 0 0 2px ${colors.input.focusBoxShadow}`,
}

export const buttonStyles = {
  default: {
    alignItems: `center`,
    backgroundColor: colors.gatsby,
    borderRadius: `${radii[2]}px`,
    borderWidth: 1,
    borderStyle: `solid`,
    borderColor: colors.gatsby,
    color: colors.white,
    cursor: `pointer`,
    display: `inline-flex`,
    fontFamily: fonts.heading,
    fontWeight: `bold`,
    flexShrink: 0,
    lineHeight: lineHeights.solid,
    textDecoration: `none`,
    whiteSpace: `nowrap`,
    paddingLeft: space[3],
    paddingRight: space[3],
    height: 36,
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
      ...focusStyle,
    },
    ":after": { content: `''`, display: `block` },
    "& svg": { marginLeft: `.2em` },
  },
  secondary: {
    backgroundColor: `transparent`,
    color: colors.gatsby,
    fontWeight: fontWeights.body,
  },
  large: {
    fontSize: fontSizes[4],
    paddingLeft: space[4],
    paddingRight: space[4],
    height: 52,
  },
  small: {
    fontSize: fontSizes[1],
    padding: `${space[2]} ${space[3]}`,
    [mediaQueries.md]: {
      fontSize: fontSizes[2],
    },
  },
  tiny: {
    borderRadius: radii[1],
    fontSize: fontSizes[1],
    padding: `${space[1]} ${space[2]}`,
    [mediaQueries.md]: {
      fontSize: fontSizes[2],
    },
  },
  ondark: {
    border: `1px solid ${colors.purple[10]}`,
    background: colors.purple[80],
  },
}

export const svgStyles = t => {
  return {
    stroke: {
      "& .svg-stroke": {
        strokeMiterlimit: 10,
        strokeWidth: 1.5,
      },
    },
    default: {
      "& .svg-stroke-dark": { stroke: `icon.neutral` },
      "& .svg-stroke-accent": { stroke: `icon.neutralLight` },
      "& .svg-stroke-background": { stroke: `icon.background` },
      "& .svg-stroke-light": { stroke: `icon.light` },
      "& .svg-fill-dark": { fill: `icon.neutral` },
      "& .svg-fill-accent": { fill: `icon.neutralLight` },
      "& .svg-fill-background": { fill: `icon.background` },
      "& .svg-fill-light": { fill: `icon.light` },
      "& .svg-fill-accent.svg-fill-transparent": { fill: `transparent` },
      "& .svg-fill-light.svg-fill-transparent": { fill: `transparent` },
    },
    active: {
      "& .svg-stroke-dark": { stroke: `icon.dark` },
      "& .svg-stroke-accent": { stroke: `icon.accent` },
      "& .svg-stroke-background": { stroke: `icon.background` },
      "& .svg-stroke-light": { stroke: `icon.light` },
      "& .svg-fill-dark": { fill: `icon.dark` },
      "& .svg-fill-accent": { fill: `icon.accent` },
      "& .svg-fill-background": { fill: `icon.background` },
      "& .svg-fill-light": { fill: `icon.light` },
      "& .svg-fill-accent.svg-fill-transparent": { fill: `icon.accent` },
      "& .svg-fill-light.svg-fill-transparent": { fill: `icon.light` },
    },
  }
}

// This is an exceptionally bad name
export const linkStyles = {
  fontSize: fontSizes[1],
  lineHeight: lineHeights.solid,
  padding: `${space[3]} 0`,
  "&&": {
    border: 0,
    color: colors.textMuted,
    display: `flex`,
    fontWeight: fontWeights.body,
  },
  "&&:hover": {
    color: colors.gatsby,
  },
}

// form elements
export const formInputFocus = {
  borderColor: colors.input.focusBorder,
  ...focusStyle,
}

export const formInput = {
  backgroundColor: colors.white,
  border: `1px solid ${colors.input.border}`,
  borderRadius: `${radii[2]}px`,
  display: `block`,
  fontFamily: fonts.system,
  fontSize: fontSizes[2],
  fontWeight: fontWeights.body,
  lineHeight: `2.25rem`,
  py: 0,
  px: space[2],
  transition: `box-shadow ${transition.speed.default} ${transition.curve.default}`,
  verticalAlign: `middle`,
  width: `100%`,
  "::placeholder": {
    color: colors.input.placeholder,
    opacity: 1,
  },
  "&:focus": {
    ...formInputFocus,
  },
  "&:disabled": {
    cursor: `not-allowed`,
    opacity: `0.5`,
  },
}

export const themedInputFocus = {
  bg: `themedInput.backgroundFocus`,
  boxShadow: t => `0 0 0 2px ${t.colors.themedInput.focusBoxShadow}`,
  outline: 0,
  width: `100%`,
}

export const themedInput = {
  ...formInput,
  appearance: `none`,
  bg: `themedInput.background`,
  border: 0,
  color: `text`,
  overflow: `hidden`,
  px: 3,
  ":focus": {
    ...themedInputFocus,
  },
  "::placeholder": {
    color: `themedInput.placeholder`,
  },
}

// Utilities
export const visuallyHidden = {
  // include `px` so we can use it with `sx`
  border: 0,
  clip: `rect(0, 0, 0, 0)`,
  height: `1px`,
  margin: `-1px`,
  overflow: `hidden`,
  padding: 0,
  position: `absolute`,
  whiteSpace: `nowrap`,
  width: `1px`,
}

// Layout
export const breakpointGutter = `@media (min-width: 42rem)`

export const pullIntoGutter = {
  marginLeft: `-${space[6]}`,
  marginRight: `-${space[6]}`,
  paddingLeft: space[6],
  paddingRight: space[6],
}
