import { style, styleVariants } from "@vanilla-extract/css"
import { vars } from "../var.css"

export const wrapperStyle = style({
  position: `relative`,
})

export const spinner = {
  position: `absolute`,
  top: `50%`,
  left: `50%`,
  transform: `translateX(-50%) translateY(-50%)`,
  height: `28px`,
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
  ":hover": {
    background: vars.color[`gray-100`],
    cursor: `pointer`,
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
