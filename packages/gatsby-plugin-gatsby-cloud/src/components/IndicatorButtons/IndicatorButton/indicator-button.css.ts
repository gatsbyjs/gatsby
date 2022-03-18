import { style, styleVariants, keyframes } from "@vanilla-extract/css"
import { vars } from "../../var.css"

const spin = keyframes({
  "0%": { transform: `rotate(0deg)` },
  "100%": { transform: `rotate(360deg)` },
})

export const wrapperStyle = style({
  position: `relative`,
})

export const spinner = {
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
}

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
  transition: `background opacity 0.3s ease-in-out`,
  selectors: {
    "&:not(:disabled):hover": {
      background: vars.color[`gray-100`],
      cursor: `pointer`,
    },
  },
  ":disabled": {
    opacity: 0.3,
    cursor: `default`,
  },
})

export const buttonStyle = styleVariants({
  default: [buttonStyleBase, { background: vars.color[`white`] }],
  highlighted: [buttonStyleBase, { background: vars.color[`purple-10`] }],
})
