import { style, styleVariants, keyframes } from "@vanilla-extract/css"
import { vars } from "../../theme.css"

const spin = keyframes({
  "0%": { transform: `translateX(-50%) translateY(-50%) rotate(0deg)` },
  "100%": { transform: `translateX(-50%) translateY(-50%) rotate(360deg)` },
})

export const wrapperStyle = style({
  position: `relative`,
})

export const spinnerStyle = style({
  position: `absolute`,
  top: `50%`,
  left: `50%`,
  transform: `translateX(-50%) translateY(-50%)`,
  height: `28px`,
  animation: `1s linear infinite ${spin}`,
  "@media": {
    "(prefers-reduced-motion: reduce)": {
      animation: `none`,
    },
    "(prefers-color-scheme: dark)": {
      color: vars.color[`purple-20`],
    },
  },
})

const buttonStyleBase = style({
  position: `relative`,
  display: `flex`,
  alignItems: `center`,
  justifyContent: `center`,
  width: `32px`,
  height: `32px`,
  borderRadius: `4px`,
  border: `none`,
  background: `none`,
  boxSizing: `border-box`,
  transitionProperty: `background opacity`,
  transitionDuration: `0.3s`,
  transitionTimingFunction: `ease-in-out`,
  cursor: `default`,
  ":disabled": {
    opacity: 0.3,
    cursor: `default`,
  },
})

export const buttonStyle = styleVariants({
  default: [buttonStyleBase, { background: vars.color[`white`] }],
  highlighted: [buttonStyleBase, { background: vars.color[`purple-10`] }],
  clickable: [
    buttonStyleBase,
    {
      background: vars.color[`white`],
      selectors: {
        "&:hover:not(:disabled)": {
          background: vars.color[`gray-10`],
          cursor: `pointer`,
        },
      },
    },
  ],
})
